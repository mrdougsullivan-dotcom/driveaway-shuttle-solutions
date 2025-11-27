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
import { type GetCitiesResponse } from "@/shared/contracts";
import { Building2, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = NativeStackScreenProps<RootStackParamList, "CitiesScreen">;

const CitiesScreen = ({ navigation, route }: Props) => {
  const { stateCode, stateName } = route.params;
  const [cities, setCities] = useState<GetCitiesResponse["cities"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const response = await api.get<GetCitiesResponse>(`/api/drivers/cities/${stateCode}`);
      setCities(response.cities);
    } catch (error) {
      console.error("Failed to load cities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCityPress = (city: string) => {
    navigation.navigate("DriversScreen", { stateCode, stateName, city });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-slate-600 mt-4">Loading cities...</Text>
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
            {stateName}
          </Text>
          <Text className="text-slate-600 text-base">
            Select a city to view drivers
          </Text>
        </View>

        <View className="gap-3">
          {cities.map((city) => (
            <Pressable
              key={city.name}
              onPress={() => handleCityPress(city.name)}
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
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center">
                      <Building2 size={24} color="#10b981" />
                    </View>
                    <View>
                      <Text className="text-xl font-semibold text-slate-900">
                        {city.name}
                      </Text>
                      <Text className="text-sm text-slate-500">
                        {city.driverCount} {city.driverCount === 1 ? "driver" : "drivers"}
                      </Text>
                    </View>
                  </View>

                  <ChevronRight size={24} color="#94a3b8" />
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default CitiesScreen;
