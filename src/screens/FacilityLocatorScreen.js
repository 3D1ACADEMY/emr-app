import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import facilityData from '../data/emergencyFacilities.json';

// Haversine distance in kilometers
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export default function FacilityLocatorScreen() {
  const [location, setLocation] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);

    // Check network state
    const netInfo = await NetInfo.fetch();
    const online = netInfo.isConnected && netInfo.isInternetReachable;
    setIsOnline(!!online);

    // Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setPermissionDenied(true);
      setFacilities(sortByDefaultCity());
      setLoading(false);
      return;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation.coords);

      if (online) {
        const withDistance = facilityData.facilities.map((f) => ({
          ...f,
          distance: getDistanceFromLatLonInKm(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude,
            f.latitude,
            f.longitude
          ),
        }));
        withDistance.sort((a, b) => a.distance - b.distance);
        setFacilities(withDistance);
      } else {
        setFacilities(sortByDefaultCity());
      }
    } catch (e) {
      // Fallback if location fails
      setFacilities(sortByDefaultCity());
    }

    setLoading(false);
  };

  const sortByDefaultCity = () => {
    const defaultCity = facilityData.defaultCity;
    return facilityData.facilities
      .map((f) => ({
        ...f,
        distance: getDistanceFromLatLonInKm(
          defaultCity.latitude,
          defaultCity.longitude,
          f.latitude,
          f.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  const handleCall = (phone) => {
    const url = `tel:${phone.replace(/[^\d+]/g, '')}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Cannot Call', 'No phone app available on this device.');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Could not open phone dialer.');
      });
  };

  const openMaps = (facility) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps.');
    });
  };

  const openNearbySearch = (query) => {
    if (!location) {
      Alert.alert('Location unavailable', 'Enable location permission to search nearby facilities.');
      return;
    }
    const encoded = encodeURIComponent(`${query} near ${location.latitude},${location.longitude}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps.');
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Locating emergency facilities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Emergency Facility Locator</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Icon
              name={isOnline ? 'wifi' : 'wifi-off'}
              size={20}
              color={isOnline ? COLORS.success : COLORS.warning}
            />
            <Text style={styles.statusText}>
              {isOnline ? 'Online — distances from your location' : 'Offline — sorted by default city'}
            </Text>
          </View>
          {permissionDenied && (
            <Text style={styles.permissionText}>
              Location permission denied. Showing default city sort.
            </Text>
          )}
          {location && (
            <Text style={styles.locationText}>
              Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        {isOnline && (
          <View style={styles.onlineActions}>
            <TouchableOpacity
              style={styles.nearbyButton}
              onPress={() => openNearbySearch('hospital')}
              activeOpacity={0.8}
            >
              <Icon name="hospital-building" size={20} color="#fff" />
              <Text style={styles.nearbyButtonText}>Find Nearby Hospitals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nearbyButton, styles.hbotButton]}
              onPress={() => openNearbySearch('hyperbaric oxygen therapy center')}
              activeOpacity={0.8}
            >
              <Icon name="diving-scuba-tank" size={20} color="#fff" />
              <Text style={styles.nearbyButtonText}>Find Nearby HBOT Centers</Text>
            </TouchableOpacity>
          </View>
        )}

        {facilities.map((facility) => (
          <View key={facility.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{facility.type}</Text>
              </View>
              {facility.distance !== undefined && (
                <Text style={styles.distanceText}>{facility.distance.toFixed(1)} km</Text>
              )}
            </View>

            <Text style={styles.facilityName}>{facility.name}</Text>
            <Text style={styles.address}>{facility.address}</Text>

            {facility.services && (
              <View style={styles.servicesRow}>
                {facility.services.map((service, idx) => (
                  <View key={idx} style={styles.serviceBadge}>
                    <Text style={styles.serviceText}>{service}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(facility.phone)}
                activeOpacity={0.8}
              >
                <Icon name="phone" size={18} color="#fff" />
                <Text style={styles.callButtonText}>Call Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => openMaps(facility)}
                activeOpacity={0.8}
              >
                <Icon name="map-marker" size={18} color={COLORS.gold} />
                <Text style={styles.mapButtonText}>Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: SPACING.base,
    fontSize: SIZES.md,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
    marginBottom: SPACING.lg,
  },
  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: COLORS.text,
    fontSize: SIZES.md,
    fontWeight: '700',
    marginLeft: SPACING.base,
  },
  permissionText: {
    color: COLORS.warning,
    fontSize: SIZES.sm,
    marginTop: SPACING.sm,
  },
  locationText: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    backgroundColor: `${COLORS.teal}20`,
    borderColor: COLORS.teal,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeText: {
    color: COLORS.teal,
    fontSize: SIZES.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  distanceText: {
    color: COLORS.gold,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
  facilityName: {
    color: COLORS.text,
    fontSize: SIZES.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.base,
  },
  serviceBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  serviceText: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  callButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    padding: SPACING.base,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  callButtonText: {
    color: '#fff',
    fontSize: SIZES.md,
    fontWeight: '800',
    marginLeft: SPACING.sm,
  },
  mapButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  mapButtonText: {
    color: COLORS.gold,
    fontSize: SIZES.md,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  onlineActions: {
    marginBottom: SPACING.lg,
  },
  nearbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.info,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.base,
  },
  hbotButton: {
    backgroundColor: COLORS.teal,
  },
  nearbyButtonText: {
    color: '#fff',
    fontSize: SIZES.md,
    fontWeight: '800',
    marginLeft: SPACING.base,
  },
});
