import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Linking,
  Pressable,
} from "react-native";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { type RootStackParamList } from "@/navigation/types";
import { api } from "@/lib/api";
import { type GetDriverResponse, type Driver } from "@/shared/contracts";
import { User, Phone, Mail, MapPin, Truck, Calendar, Navigation, FileText } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = NativeStackScreenProps<RootStackParamList, "DriverDetailScreen">;

const DriverDetailScreen = ({ route }: Props) => {
  const { driverId } = route.params;
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDriver();
  }, []);

  const loadDriver = async () => {
    try {
      const response = await api.get<GetDriverResponse>(`/api/drivers/${driverId}`);
      setDriver(response.driver);
    } catch (error) {
      console.error("Failed to load driver:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleOpenMaps = (city: string, state: string) => {
    const query = encodeURIComponent(`${city}, ${state}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return { bg: "#dcfce7", text: "#16a34a", label: "Available" };
      case "on_trip":
        return { bg: "#fef3c7", text: "#d97706", label: "On Trip" };
      case "offline":
        return { bg: "#f1f5f9", text: "#64748b", label: "Offline" };
      default:
        return { bg: "#f1f5f9", text: "#64748b", label: status };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-slate-600 mt-4">Loading driver...</Text>
      </View>
    );
  }

  if (!driver) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-600">Driver not found</Text>
      </View>
    );
  }

  const statusColors = getStatusColor(driver.status);

  // Parse service locations if they exist
  let serviceLocations: string[] = [];
  if (driver.serviceLocations) {
    try {
      serviceLocations = JSON.parse(driver.serviceLocations);
    } catch (e) {
      console.error("Failed to parse service locations:", e);
    }
  }

  // Parse multiple phone numbers (e.g., "Melo: (928) 315-8777, Sonia: (951) 349-2449")
  const phoneContacts: Array<{ name: string; number: string }> = [];
  if (driver.phoneNumber) {
    // Check if it contains multiple contacts with names
    const contactPattern = /([^:,]+):\s*(\([0-9]{3}\)\s*[0-9]{3}-[0-9]{4})/g;
    let match;
    let hasMatches = false;

    while ((match = contactPattern.exec(driver.phoneNumber)) !== null) {
      hasMatches = true;
      phoneContacts.push({
        name: match[1].trim(),
        number: match[2].trim()
      });
    }

    // If no named contacts found, check for just phone numbers
    if (!hasMatches) {
      const phonePattern = /(\([0-9]{3}\)\s*[0-9]{3}-[0-9]{4})/g;
      while ((match = phonePattern.exec(driver.phoneNumber)) !== null) {
        phoneContacts.push({
          name: '',
          number: match[1].trim()
        });
      }
    }

    // If still no matches, use the whole string as one contact
    if (phoneContacts.length === 0 && driver.phoneNumber.trim()) {
      phoneContacts.push({
        name: '',
        number: driver.phoneNumber.trim()
      });
    }
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 }}
      >
        {/* Header Card */}
        <LinearGradient
          colors={["#3b82f6", "#1e40af"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View className="items-center">
            <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
              <User size={48} color="#3b82f6" />
            </View>
            <Text className="text-3xl font-bold text-white mb-2">
              {driver.name}
            </Text>
            <View
              style={{ backgroundColor: statusColors.bg }}
              className="px-4 py-2 rounded-full"
            >
              <Text
                style={{ color: statusColors.text }}
                className="text-sm font-semibold"
              >
                {statusColors.label}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Contact Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-slate-900 mb-3">
            Contact Information
          </Text>
          <View className="gap-3">
            {phoneContacts.map((contact, index) => (
              <Pressable
                key={index}
                onPress={() => handleCall(contact.number)}
                className="active:opacity-70"
              >
                <View className="bg-white rounded-xl p-4 flex-row items-center gap-3 border border-slate-200">
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                    <Phone size={20} color="#16a34a" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-slate-500 mb-1">
                      {contact.name ? contact.name : "Phone"}
                    </Text>
                    <Text className="text-base font-semibold text-slate-900">
                      {contact.number}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}

            {driver.email && (
              <Pressable
                onPress={() => handleEmail(driver.email!)}
                className="active:opacity-70"
              >
                <View className="bg-white rounded-xl p-4 flex-row items-center gap-3 border border-slate-200">
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                    <Mail size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-slate-500 mb-1">Email</Text>
                    <Text className="text-base font-semibold text-slate-900">
                      {driver.email}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          </View>
        </View>

        {/* Details Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-slate-900 mb-3">
            Driver Details
          </Text>
          <View className="bg-white rounded-xl p-4 gap-4 border border-slate-200">
            <Pressable 
              onPress={() => handleOpenMaps(driver.city, driver.state)}
              className="active:opacity-70"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
                  <MapPin size={20} color="#9333ea" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-purple-600 mb-1 font-medium">📍 TAP TO OPEN IN GOOGLE MAPS</Text>
                  <Text className="text-base font-semibold text-purple-700">
                    {driver.city}, {driver.state}
                  </Text>
                </View>
              </View>
            </Pressable>

            {driver.vehicleType && (
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
                  <Truck size={20} color="#ea580c" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-slate-500 mb-1">Vehicle Type</Text>
                  <Text className="text-base font-semibold text-slate-900">
                    {driver.vehicleType}
                  </Text>
                </View>
              </View>
            )}

            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-cyan-100 rounded-full items-center justify-center">
                <Calendar size={20} color="#0891b2" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-slate-500 mb-1">Joined</Text>
                <Text className="text-base font-semibold text-slate-900">
                  {formatDate(driver.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Service Locations Section */}
        {serviceLocations.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-slate-900 mb-3">
              Service Locations
            </Text>
            <View className="bg-white rounded-xl p-4 border border-slate-200">
              {serviceLocations.map((location, index) => (
                <View
                  key={index}
                  className={`flex-row items-center gap-3 ${
                    index < serviceLocations.length - 1 ? "pb-4 mb-4 border-b border-slate-100" : ""
                  }`}
                >
                  <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center">
                    <Navigation size={20} color="#6366f1" />
                  </View>
                  <Text className="text-base text-slate-900 flex-1">{location}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes Section */}
        {driver.notes && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-slate-900 mb-3">
              Notes
            </Text>
            <View className="bg-white rounded-xl p-4 border border-slate-200">
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center">
                  <FileText size={20} color="#d97706" />
                </View>
                <Text className="text-base text-slate-700 flex-1 leading-6">
                  {driver.notes}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DriverDetailScreen;
