import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import RNMapView, {Marker, Polyline, Callout} from 'react-native-maps';
import {Text} from 'react-native';

const DEFAULT_DELTA = {latitudeDelta: 0.05, longitudeDelta: 0.05};

/**
 * MapView — renders the interactive map with:
 *   • A blue "You are here" pin for the device location
 *   • Numbered red pins for each user-added stop
 *   • An optional green polyline showing the optimized route
 *
 * Props:
 *   origin        { latitude, longitude }          — GPS / fallback position
 *   stops         Array<{ id, latitude, longitude, label }>
 *   optimizedRoute Array<{ id, latitude, longitude, label }> | null
 *   onMapPress    (coordinate: { latitude, longitude }) => void
 */
export default function MapView({origin, stops, optimizedRoute, onMapPress}) {
  const handlePress = useCallback(
    event => {
      onMapPress && onMapPress(event.nativeEvent.coordinate);
    },
    [onMapPress],
  );

  // Build polyline coordinates: origin → each stop in optimized order
  const polylineCoords =
    optimizedRoute && optimizedRoute.length > 0
      ? [origin, ...optimizedRoute.map(s => ({latitude: s.latitude, longitude: s.longitude}))]
      : [];

  // Which stop list to show as markers (optimized numbering vs. insertion order)
  const displayStops = optimizedRoute || stops;

  return (
    <RNMapView
      style={styles.map}
      initialRegion={{
        latitude: origin.latitude,
        longitude: origin.longitude,
        ...DEFAULT_DELTA,
      }}
      onPress={handlePress}
      showsUserLocation={false}
      showsMyLocationButton={false}>
      {/* Origin marker */}
      <Marker
        coordinate={{latitude: origin.latitude, longitude: origin.longitude}}
        pinColor="#2979FF"
        title="Start"
        description="Your current location"
      />

      {/* Stop markers — numbered in display order */}
      {displayStops.map((stop, index) => (
        <Marker
          key={stop.id}
          coordinate={{latitude: stop.latitude, longitude: stop.longitude}}
          title={`Stop ${index + 1}`}
          description={stop.label || `${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)}`}>
          <View style={styles.numberMarker}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
        </Marker>
      ))}

      {/* Optimized route polyline */}
      {polylineCoords.length > 1 && (
        <Polyline
          coordinates={polylineCoords}
          strokeColor="#FF6D00"
          strokeWidth={3}
          lineDashPattern={[8, 4]}
        />
      )}
    </RNMapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  numberMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D32F2F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
