import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { type RootStackParamList } from "@/navigation/types";
import { api } from "@/lib/api";
import { type GetDriversResponse, type Driver } from "@/shared/contracts";
import { User, Phone, Mail, Truck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = NativeStackScreenProps<RootStackParamList, "DriversScreen">;

const DriversScreen = ({ navigation, route }: Props) => {
  const { stateCode, stateName, city } = route.params;
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const response = await api.get<GetDriversResponse>("/api/drivers");
      // Filter drivers by state and city
      const filtered = response.drivers.filter(
        (d) => d.state === stateCode && d.city === city
      );
      setDrivers(filtered);
    } catch (error) {
      console.error("Failed to load drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDriverPress = (driverId: string) => {
    navigation.navigate("DriverDetailScreen", { driverId });
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

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-slate-600 mt-4">Loading drivers...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 }}
      >
        <View className="mb-6">
          <Text className="text-3xl font-bold text-slate-900 mb-2">
            {city}
          </Text>
          <Text className="text-slate-600 text-base">
            {stateName} • {drivers.length} {drivers.length === 1 ? "driver" : "drivers"}
          </Text>
        </View>

        <View className="gap-3">
          {drivers.map((driver) => {
            const statusColors = getStatusColor(driver.status);
            return (
              <Pressable
                key={driver.id}
                onPress={() => handleDriverPress(driver.id)}
                className="active:opacity-70"
              >
                <LinearGradient
                  colors={["#ffffff", "#f8fafc"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-3 mb-2">
                        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                          <User size={24} color="#3b82f6" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-xl font-bold text-slate-900">
                            {driver.name}
                          </Text>
                          {driver.vehicleType && (
                            <View className="flex-row items-center gap-1 mt-1">
                              <Truck size={14} color="#64748b" />
                              <Text className="text-sm text-slate-500">
                                {driver.vehicleType}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    <View
                      style={{ backgroundColor: statusColors.bg }}
                      className="px-3 py-1.5 rounded-full"
                    >
                      <Text
                        style={{ color: statusColors.text }}
                        className="text-xs font-semibold"
                      >
                        {statusColors.label}
                      </Text>
                    </View>
                  </View>

                  <View className="gap-2 ml-15">
                    {driver.phoneNumber && (
                      <View className="flex-row items-center gap-2">
                        <Phone size={16} color="#64748b" />
                        <Text className="text-slate-700 flex-1" numberOfLines={1}>
                          {driver.phoneNumber.includes(':')
                            ? 'Multiple contacts available'
                            : driver.phoneNumber
                          }
                        </Text>
                      </View>
                    )}
                    {driver.email && (
                      <View className="flex-row items-center gap-2">
                        <Mail size={16} color="#64748b" />
                        <Text className="text-slate-700">{driver.email}</Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default DriversScreen;
