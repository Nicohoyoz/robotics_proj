import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';

/**
 * OptimizeButton — fixed bottom action bar.
 *
 * Props:
 *   stopCount      number   — disables button when < 2
 *   isOptimized    boolean  — switches label / style
 *   isLoading      boolean  — shows spinner during computation
 *   totalDistance  number | null  — km, shown after optimization
 *   onOptimize     () => void
 *   onReset        () => void
 */
export default function OptimizeButton({
  stopCount,
  isOptimized,
  isLoading,
  totalDistance,
  onOptimize,
  onReset,
}) {
  const canOptimize = stopCount >= 2;

  return (
    <View style={styles.container}>
      {isOptimized && totalDistance != null && (
        <Text style={styles.distanceLabel}>
          Total distance: {totalDistance.toFixed(2)} km
        </Text>
      )}

      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.optimizeBtn,
            !canOptimize && styles.disabled,
          ]}
          onPress={onOptimize}
          disabled={!canOptimize || isLoading}
          activeOpacity={0.8}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {isOptimized ? 'Re-optimize' : 'Optimize Route'}
            </Text>
          )}
        </TouchableOpacity>

        {isOptimized && (
          <TouchableOpacity
            style={[styles.button, styles.resetBtn]}
            onPress={onReset}
            activeOpacity={0.8}>
            <Text style={[styles.buttonText, styles.resetText]}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {!canOptimize && stopCount < 2 && (
        <Text style={styles.hint}>
          Add {2 - stopCount} more stop{stopCount === 1 ? '' : 's'} to optimize
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optimizeBtn: {
    backgroundColor: '#2979FF',
  },
  resetBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2979FF',
    flex: 0.4,
  },
  disabled: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  resetText: {
    color: '#2979FF',
  },
  distanceLabel: {
    fontSize: 13,
    color: '#388E3C',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 6,
  },
});
