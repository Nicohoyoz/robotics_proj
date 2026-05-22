import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import MapViewComponent from './src/components/MapView';
import StopsList from './src/components/StopsList';
import OptimizeButton from './src/components/OptimizeButton';
import {optimizeRoute, totalRouteDistance} from './src/algorithms/routeOptimizer';
import {reverseGeocode} from './src/utils/geocoding';

// Fallback if GPS is denied or unavailable
const FALLBACK_LOCATION = {latitude: 40.4406, longitude: -74.4474};

let stopIdCounter = 1;

export default function App() {
  const [origin, setOrigin] = useState(FALLBACK_LOCATION);
  const [locationReady, setLocationReady] = useState(false);
  const [stops, setStops] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalDistance, setTotalDistance] = useState(null);
  const watchId = useRef(null);

  // ─── GPS ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    Geolocation.requestAuthorization();

    Geolocation.getCurrentPosition(
      position => {
        setOrigin({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationReady(true);
      },
      error => {
        console.warn('GPS error, using fallback:', error.message);
        setLocationReady(true); // proceed with fallback
      },
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 30000},
    );

    // Watch for position updates during the session
    watchId.current = Geolocation.watchPosition(
      position => {
        setOrigin({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        // Invalidate any existing optimized route when origin moves significantly
        setIsOptimized(false);
        setOptimizedRoute(null);
        setTotalDistance(null);
      },
      error => console.warn('Watch position error:', error.message),
      {enableHighAccuracy: true, distanceFilter: 10},
    );

    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  // ─── Stop Management ──────────────────────────────────────────────────────

  const handleMapPress = useCallback(
    async coordinate => {
      const label = await reverseGeocode(coordinate.latitude, coordinate.longitude);
      const newStop = {
        id: String(stopIdCounter++),
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        label,
      };

      setStops(prev => [...prev, newStop]);
      // Adding a new stop invalidates the existing optimized route
      setIsOptimized(false);
      setOptimizedRoute(null);
      setTotalDistance(null);
    },
    [],
  );

  const handleRemoveStop = useCallback(id => {
    setStops(prev => prev.filter(s => s.id !== id));
    setIsOptimized(false);
    setOptimizedRoute(null);
    setTotalDistance(null);
  }, []);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear all stops?',
      'This will remove all stops from the current session.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setStops([]);
            setOptimizedRoute(null);
            setIsOptimized(false);
            setTotalDistance(null);
          },
        },
      ],
    );
  }, []);

  // ─── Optimization ─────────────────────────────────────────────────────────

  const handleOptimize = useCallback(() => {
    if (stops.length < 2) {
      return;
    }

    setIsLoading(true);

    // Run on next tick so the spinner renders before the synchronous O(n²) work
    setTimeout(() => {
      try {
        const route = optimizeRoute(origin, stops);
        const dist = totalRouteDistance(origin, route);

        setOptimizedRoute(route);
        setIsOptimized(true);
        setTotalDistance(dist);
      } catch (err) {
        Alert.alert('Optimization failed', err.message);
      } finally {
        setIsLoading(false);
      }
    }, 50);
  }, [origin, stops]);

  const handleReset = useCallback(() => {
    setOptimizedRoute(null);
    setIsOptimized(false);
    setTotalDistance(null);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Route Optimizer</Text>
        {!locationReady && (
          <Text style={styles.headerSub}>Acquiring GPS…</Text>
        )}
      </View>

      <View style={styles.mapContainer}>
        <MapViewComponent
          origin={origin}
          stops={stops}
          optimizedRoute={optimizedRoute}
          onMapPress={handleMapPress}
        />
      </View>

      <StopsList
        stops={stops}
        optimizedRoute={optimizedRoute}
        onRemoveStop={handleRemoveStop}
        onClearAll={handleClearAll}
      />

      <OptimizeButton
        stopCount={stops.length}
        isOptimized={isOptimized}
        isLoading={isLoading}
        totalDistance={totalDistance}
        onOptimize={handleOptimize}
        onReset={handleReset}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  headerSub: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
  },
});
