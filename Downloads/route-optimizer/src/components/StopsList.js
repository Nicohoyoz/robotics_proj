import React, {useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

/**
 * StopsList — scrollable list of added stops with per-stop delete control.
 *
 * Props:
 *   stops          Array<{ id, latitude, longitude, label }>
 *   optimizedRoute Array<{ id, ... }> | null  — reordered list post-optimization
 *   onRemoveStop   (id: string) => void
 *   onClearAll     () => void
 */
export default function StopsList({
  stops,
  optimizedRoute,
  onRemoveStop,
  onClearAll,
}) {
  const displayStops = optimizedRoute || stops;

  const renderItem = useCallback(
    ({item, index}) => (
      <View style={styles.row}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{index + 1}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.label} numberOfLines={1}>
            {item.label || 'Unnamed stop'}
          </Text>
          <Text style={styles.coords}>
            {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onRemoveStop(item.id)}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.deleteTxt}>✕</Text>
        </TouchableOpacity>
      </View>
    ),
    [onRemoveStop],
  );

  if (stops.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Tap the map to add stops</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {optimizedRoute ? 'Optimized Route' : 'Stops'} ({displayStops.length})
        </Text>
        <TouchableOpacity onPress={onClearAll}>
          <Text style={styles.clearAll}>Clear all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={displayStops}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 220,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  clearAll: {
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#212121',
  },
  coords: {
    fontSize: 11,
    color: '#757575',
    marginTop: 1,
  },
  deleteBtn: {
    paddingLeft: 12,
  },
  deleteTxt: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  empty: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  emptyText: {
    fontSize: 13,
    color: '#9E9E9E',
  },
});
