import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Calculator, MapPin, Navigation, Phone, Mail, Building2, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'DistanceCalculator'>;

interface Driver {
  id: string;
  name: string;
  phoneNumber: string | null;
  email: string | null;
  state: string;
  city: string;
  status: "available" | "on_trip" | "offline";
  vehicleType: string | null;
  serviceLocations: string | null;
}

interface DistanceResult {
  distance: number;
  duration: string;
  fromCity: string;
  toCity: string;
  closestDriver?: {
    driver: Driver;
    distance: number;
  };
}

const DistanceCalculatorScreen = ({ navigation }: Props) => {
  const [dropOffCity, setDropOffCity] = useState('');
  const [pickupCity, setPickupCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DistanceResult | null>(null);
  const [error, setError] = useState('');

  // Cache for geocoding results to avoid repeated API calls
  const geocodeCache = React.useRef<Map<string, { lat: number; lng: number }>>(new Map());

  // Calculate distance using routing API for actual driving distance
  const calculateDistance = async () => {
    if (!dropOffCity.trim() || !pickupCity.trim()) {
      setError('Please enter both cities');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Get coordinates for both cities using a geocoding service
      const fromCoords = await geocodeCity(dropOffCity);
      const toCoords = await geocodeCity(pickupCity);

      if (!fromCoords || !toCoords) {
        setError('Could not find one or both cities. Please check spelling and include state (e.g., "Macungie, PA")');
        setLoading(false);
        return;
      }

      // Get driving distance using routing API
      const routingResponse = await api.post<{
        success: boolean;
        distanceMiles?: number;
        durationSeconds?: number;
        estimated?: boolean;
      }>('/api/routing/distance', {
        fromLat: fromCoords.lat,
        fromLng: fromCoords.lng,
        toLat: toCoords.lat,
        toLng: toCoords.lng
      });

      if (!routingResponse.success || !routingResponse.distanceMiles) {
        setError('Could not calculate driving distance. Please try again.');
        setLoading(false);
        return;
      }

      const distance = routingResponse.distanceMiles;
      const durationSeconds = routingResponse.durationSeconds || (distance / 60) * 3600;

      // Convert duration to readable format
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.round((durationSeconds % 3600) / 60);
      const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      // Find closest driver to pickup location
      const closestDriver = await findClosestDriver(toCoords);

      setResult({
        distance: Math.round(distance),
        duration,
        fromCity: dropOffCity,
        toCity: pickupCity,
        closestDriver
      });
    } catch (err) {
      console.error('Distance calculation error:', err);
      setError('Error calculating distance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Find closest driver to a given location
  const findClosestDriver = async (coords: { lat: number; lng: number }) => {
    try {
      // Fetch all drivers from the backend
      const response = await api.get<{ drivers: Driver[] }>('/api/drivers');
      const drivers = response.drivers;

      if (!drivers || drivers.length === 0) {
        return undefined;
      }

      // Get unique cities and check cache first
      const uniqueCities = Array.from(new Set(drivers.map(d => `${d.city}, ${d.state}`)));
      const citiesToGeocode: string[] = [];
      const cityCoordinates = new Map<string, { lat: number; lng: number }>();

      // Check cache for each city
      for (const cityState of uniqueCities) {
        if (geocodeCache.current.has(cityState)) {
          cityCoordinates.set(cityState, geocodeCache.current.get(cityState)!);
        } else {
          citiesToGeocode.push(cityState);
        }
      }

      // Batch geocode remaining cities using backend API
      if (citiesToGeocode.length > 0) {
        const geocodeResponse = await api.post<{
          success: boolean;
          results: Record<string, { lat: number; lng: number } | null>
        }>('/api/geocode/batch', { cities: citiesToGeocode });

        if (geocodeResponse.success && geocodeResponse.results) {
          Object.entries(geocodeResponse.results).forEach(([cityState, coords]) => {
            if (coords) {
              cityCoordinates.set(cityState, coords);
              geocodeCache.current.set(cityState, coords);
            }
          });
        }
      }

      // Calculate distance from each driver's location to the pickup point
      let closestDriver: Driver | null = null;
      let minDistance = Infinity;

      for (const driver of drivers) {
        const cityState = `${driver.city}, ${driver.state}`;
        const driverCoords = cityCoordinates.get(cityState);

        if (driverCoords) {
          const dist = haversineDistance(
            coords.lat,
            coords.lng,
            driverCoords.lat,
            driverCoords.lng
          );

          if (dist < minDistance) {
            minDistance = dist;
            closestDriver = driver;
          }
        }
      }

      if (closestDriver) {
        return {
          driver: closestDriver,
          distance: Math.round(minDistance)
        };
      }

      return undefined;
    } catch (error) {
      console.error('Failed to find closest driver:', error);
      return undefined;
    }
  };

  // Geocode with caching to avoid repeated API calls
  const geocodeCityWithCache = async (city: string): Promise<{ lat: number; lng: number } | null> => {
    // Check cache first
    if (geocodeCache.current.has(city)) {
      return geocodeCache.current.get(city)!;
    }

    // If not in cache, geocode and store
    const coords = await geocodeCity(city);
    if (coords) {
      geocodeCache.current.set(city, coords);
    }

    return coords;
  };

  // Geocode city using backend API (handles rate limiting and caching)
  const geocodeCity = async (city: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await api.post<{ success: boolean; lat?: number; lng?: number; error?: string }>('/api/geocode', { city });

      if (response.success && response.lat && response.lng) {
        return {
          lat: response.lat,
          lng: response.lng
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Haversine formula to calculate distance between two coordinates
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const clearForm = () => {
    setDropOffCity('');
    setPickupCity('');
    setResult(null);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 16, paddingTop: 60, paddingBottom: 32 }}
        >
          {/* Back Button */}
          <Pressable
            onPress={() => navigation.goBack()}
            className="mb-4 active:opacity-70"
          >
            <View className="flex-row items-center gap-2">
              <ArrowLeft size={24} color="#ffffff" strokeWidth={2.5} />
              <Text className="text-white font-semibold text-base">Back</Text>
            </View>
          </Pressable>

          <View className="flex-row items-center gap-3 mb-2">
            <Calculator size={32} color="#ffffff" strokeWidth={2.5} />
            <Text className="text-3xl font-bold text-white">
              Distance Calculator
            </Text>
          </View>
          <Text className="text-blue-100 text-base">
            Calculate distance from drop-off to pickup location
          </Text>
        </LinearGradient>

        <View className="px-4 py-6">
          {/* Instructions */}
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <Text className="text-blue-900 font-semibold mb-2">How to use:</Text>
            <Text className="text-blue-800 text-sm">
              1. Enter your vehicle drop-off city (where you deliver the load)
              {'\n'}2. Enter the pickup city (where shuttle drivers are located)
              {'\n'}3. Tap Calculate to see the distance
            </Text>
          </View>

          {/* Drop-off Location */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              <MapPin size={20} color="#64748b" />
              <Text className="text-slate-700 font-semibold text-lg">
                Drop-off Location
              </Text>
            </View>
            <TextInput
              value={dropOffCity}
              onChangeText={setDropOffCity}
              placeholder="e.g., Macungie, PA"
              className="bg-white border-2 border-slate-300 rounded-xl px-4 py-4 text-lg text-slate-900"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="addressCity"
            />
            <Text className="text-slate-500 text-sm mt-1 ml-1">
              Where you&apos;re delivering the vehicle
            </Text>
          </View>

          {/* Pickup Location */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              <Navigation size={20} color="#64748b" />
              <Text className="text-slate-700 font-semibold text-lg">
                Shuttle Pickup Location
              </Text>
            </View>
            <TextInput
              value={pickupCity}
              onChangeText={setPickupCity}
              placeholder="e.g., Hollidaysburg, PA"
              className="bg-white border-2 border-slate-300 rounded-xl px-4 py-4 text-lg text-slate-900"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="addressCity"
            />
            <Text className="text-slate-500 text-sm mt-1 ml-1">
              Where shuttle drivers are located
            </Text>
          </View>

          {/* Calculate Button */}
          <Pressable
            onPress={calculateDistance}
            disabled={loading}
            className="active:opacity-80 mb-4"
          >
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 16,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Calculator size={24} color="#ffffff" strokeWidth={2.5} />
                  <Text className="text-white font-bold text-lg">
                    Calculate Distance
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* Clear Button */}
          {(dropOffCity || pickupCity || result) && (
            <Pressable
              onPress={clearForm}
              className="bg-slate-200 rounded-xl py-4 active:opacity-80"
            >
              <Text className="text-slate-700 font-semibold text-center">
                Clear
              </Text>
            </Pressable>
          )}

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
              <Text className="text-red-800 font-medium">{error}</Text>
            </View>
          ) : null}

          {/* Result */}
          {result ? (
            <View className="mt-6">
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 20,
                  padding: 24,
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Text className="text-white text-lg font-semibold mb-4">
                  Distance Result:
                </Text>

                <View className="bg-white/20 rounded-xl p-4 mb-3">
                  <Text className="text-white/80 text-sm mb-1">From:</Text>
                  <Text className="text-white font-bold text-xl">{result.fromCity}</Text>
                </View>

                <View className="bg-white/20 rounded-xl p-4 mb-4">
                  <Text className="text-white/80 text-sm mb-1">To:</Text>
                  <Text className="text-white font-bold text-xl">{result.toCity}</Text>
                </View>

                <View className="bg-white/30 rounded-xl p-6">
                  <Text className="text-white text-center text-5xl font-bold mb-2">
                    {result.distance}
                  </Text>
                  <Text className="text-white text-center text-xl font-semibold">
                    miles
                  </Text>
                  <Text className="text-white/90 text-center text-lg mt-3">
                    Est. driving time: {result.duration}
                  </Text>
                </View>

                <Text className="text-white/80 text-sm text-center mt-4">
                  * Driving distance calculated using actual road routes.
                </Text>
              </LinearGradient>

              {/* Closest Driver Card */}
              {result.closestDriver ? (
                <View className="mt-4">
                  <View className="bg-white rounded-2xl p-5 shadow-lg" style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 6,
                  }}>
                    <View className="flex-row items-center gap-3 mb-4">
                      <View className="bg-blue-100 p-3 rounded-full">
                        <Building2 size={24} color="#3b82f6" strokeWidth={2.5} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-slate-500 text-sm font-medium">Closest Shuttle Company</Text>
                        <Text className="text-slate-900 text-lg font-bold">
                          {result.closestDriver.driver.name}
                        </Text>
                      </View>
                    </View>

                    <View className="bg-slate-50 rounded-xl p-4 mb-3">
                      <View className="flex-row items-center gap-2 mb-2">
                        <MapPin size={16} color="#64748b" />
                        <Text className="text-slate-700 font-semibold">Location</Text>
                      </View>
                      <Text className="text-slate-900 text-base ml-6">
                        {result.closestDriver.driver.city}, {result.closestDriver.driver.state}
                      </Text>
                      <Text className="text-blue-600 font-semibold text-base ml-6 mt-1">
                        {result.closestDriver.distance} miles from pickup
                      </Text>
                    </View>

                    {result.closestDriver.driver.phoneNumber && (
                      <View className="flex-row items-center gap-2 mb-2">
                        <Phone size={16} color="#10b981" />
                        <Text className="text-slate-700 flex-1">
                          {result.closestDriver.driver.phoneNumber}
                        </Text>
                      </View>
                    )}

                    {result.closestDriver.driver.email && (
                      <View className="flex-row items-center gap-2 mb-3">
                        <Mail size={16} color="#3b82f6" />
                        <Text className="text-slate-700 flex-1">
                          {result.closestDriver.driver.email}
                        </Text>
                      </View>
                    )}

                    <Pressable
                      onPress={() => navigation.navigate('DriverDetailScreen', {
                        driverId: result.closestDriver!.driver.id
                      })}
                      className="active:opacity-80 mt-2"
                    >
                      <LinearGradient
                        colors={["#3b82f6", "#2563eb"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <Text className="text-white font-bold text-center text-base">
                          View Full Details
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <Text className="text-amber-900 font-medium text-center">
                    No shuttle companies found near pickup location
                  </Text>
                </View>
              )}

              {/* Find Shuttle Drivers Button */}
              <Pressable
                onPress={() => navigation.navigate('MapScreen')}
                className="mt-4 bg-slate-600 rounded-xl py-4 active:opacity-80"
              >
                <Text className="text-white font-semibold text-center text-base">
                  Browse All Shuttle Companies
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DistanceCalculatorScreen;
