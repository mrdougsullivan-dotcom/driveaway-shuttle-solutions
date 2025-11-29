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

  // Note: Geocoding cache is now handled server-side for better performance

  // Calculate distance using routing API for actual driving distance
  // OPTIMIZED: Uses parallel geocoding and pre-cached driver locations
  const calculateDistance = async () => {
    if (!dropOffCity.trim() || !pickupCity.trim()) {
      setError('Please enter both cities');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // OPTIMIZATION: Geocode both cities in a single API call (parallel)
      const geocodeResponse = await api.post<{
        success: boolean;
        city1: { lat: number; lng: number } | null;
        city2: { lat: number; lng: number } | null;
      }>('/api/geocode/parallel', {
        city1: dropOffCity,
        city2: pickupCity
      });

      const fromCoords = geocodeResponse.city1;
      const toCoords = geocodeResponse.city2;

      if (!fromCoords || !toCoords) {
        setError('Could not find one or both cities. Please check spelling and include state (e.g., "Macungie, PA")');
        setLoading(false);
        return;
      }

      // Get driving distance and closest driver in parallel
      const [routingResponse, closestDriverResponse] = await Promise.all([
        api.post<{
          success: boolean;
          distanceMiles?: number;
          durationSeconds?: number;
          estimated?: boolean;
        }>('/api/routing/distance', {
          fromLat: fromCoords.lat,
          fromLng: fromCoords.lng,
          toLat: toCoords.lat,
          toLng: toCoords.lng
        }),
        // OPTIMIZATION: Use new closest-driver endpoint with pre-cached locations
        api.post<{
          success: boolean;
          closestDriver: {
            id: string;
            name: string;
            city: string;
            state: string;
            phoneNumber: string | null;
            distance: number;
          } | null;
        }>('/api/geocode/closest-driver', {
          lat: toCoords.lat,
          lng: toCoords.lng
        })
      ]);

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

      // Format closest driver result
      let closestDriver: { driver: Driver; distance: number } | undefined;
      if (closestDriverResponse.success && closestDriverResponse.closestDriver) {
        const cd = closestDriverResponse.closestDriver;
        closestDriver = {
          driver: {
            id: cd.id,
            name: cd.name,
            phoneNumber: cd.phoneNumber,
            email: null,
            state: cd.state,
            city: cd.city,
            status: "available",
            vehicleType: null,
            serviceLocations: null
          },
          distance: cd.distance
        };
      }

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

  // Legacy functions kept for reference but no longer used
  // The new /api/geocode/closest-driver endpoint handles this server-side
  // which is MUCH faster because driver locations are pre-cached on the server

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

  // Note: Haversine distance calculation is now handled server-side

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
            Calculate distance from pickup to drop-off location
          </Text>
        </LinearGradient>

        <View className="px-4 py-6">
          {/* Instructions */}
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <Text className="text-blue-900 font-semibold mb-2">How to use:</Text>
            <Text className="text-blue-800 text-sm">
              1. Enter the pickup city (where shuttle drivers are located)
              {'\n'}2. Enter your vehicle drop-off city (where you deliver the load)
              {'\n'}3. Tap Calculate to see the distance
            </Text>
          </View>

          {/* Pickup Location */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              <Navigation size={20} color="#64748b" />
              <Text className="text-slate-700 font-semibold text-lg">
                Pickup Location
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
