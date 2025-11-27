import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ImageBackground,
} from "react-native";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { type RootStackParamList } from "@/navigation/types";
import { api } from "@/lib/api";
import { type GetStatesResponse } from "@/shared/contracts";
import { MapPin, ChevronRight, Calculator } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = NativeStackScreenProps<RootStackParamList, "MapScreen">;

const ITEM_HEIGHT = 60;
const PICKER_HEIGHT = 300;

const MapScreen = ({ navigation }: Props) => {
  const [states, setStates] = useState<GetStatesResponse["states"]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const response = await api.get<GetStatesResponse>("/api/drivers/states");
      setStates(response.states);
    } catch (error) {
      console.error("Failed to load states:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < states.length && index !== selectedIndex) {
      setSelectedIndex(index);
    }
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  const handleContinue = () => {
    const selectedState = states[selectedIndex];
    if (selectedState) {
      navigation.navigate("CitiesScreen", {
        stateCode: selectedState.code,
        stateName: selectedState.name
      });
    }
  };

  const selectedState = states[selectedIndex];

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-slate-600 mt-4">Loading states...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        {/* Header with Image Background */}
        <ImageBackground
          source={require("../../assets/image-1764111920.jpeg")}
          style={{ marginBottom: 24 }}
          imageStyle={{ opacity: 0.3 }}
        >
          <LinearGradient
            colors={["rgba(248, 250, 252, 0.95)", "rgba(248, 250, 252, 0.98)"]}
            style={{ paddingHorizontal: 16, paddingTop: 60, paddingBottom: 32 }}
          >
            <Text className="text-3xl font-bold text-slate-900 mb-2">
              Driveaway Shuttle Solutions
            </Text>
            <Text className="text-slate-600 text-base mb-4">
              Calculate distances & find shuttle drivers
            </Text>

            {/* Distance Calculator Button - MOVED TO HEADER */}
            <Pressable
              onPress={() => {
                console.log('Distance Calculator button pressed!');
                navigation.navigate('DistanceCalculator');
              }}
              className="active:opacity-80"
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 16,
                  padding: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Calculator size={24} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-white font-bold text-lg">
                  Distance Calculator
                </Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </ImageBackground>

        <View className="px-4">
          {/* State Info Card */}
          {selectedState && (
            <View className="mb-6">
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 20,
                  padding: 24,
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-3 mb-3">
                      <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center">
                        <MapPin size={28} color="#ffffff" strokeWidth={2.5} />
                      </View>
                      <View>
                        <Text className="text-2xl font-bold text-white">
                          {selectedState.name}
                        </Text>
                        <Text className="text-sm text-blue-100 font-medium">
                          {selectedState.code}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-white/30 px-5 py-3 rounded-2xl backdrop-blur">
                    <Text className="text-xs text-white/90 font-semibold mb-1">
                      DRIVERS
                    </Text>
                    <Text className="text-white font-bold text-2xl text-center">
                      {selectedState.driverCount}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* iOS-style Picker Wheel */}
          <View
            className="bg-white rounded-3xl overflow-hidden mb-6"
            style={{
              height: PICKER_HEIGHT,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            {/* Top gradient fade */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0)']}
                style={{ flex: 1 }}
              />
            </View>

            {/* Selection highlight */}
            <View
              style={{
                position: 'absolute',
                top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
                left: 16,
                right: 16,
                height: ITEM_HEIGHT,
                backgroundColor: '#f0f9ff',
                borderRadius: 12,
                borderWidth: 2,
                borderColor: '#3b82f6',
                zIndex: 5,
                pointerEvents: 'none',
              }}
            />

            {/* Scrollable list */}
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingTop: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
                paddingBottom: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
              }}
            >
              {states.map((state, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <Pressable
                    key={state.code}
                    onPress={() => {
                      setSelectedIndex(index);
                      scrollToIndex(index);
                    }}
                    style={{
                      height: ITEM_HEIGHT,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isSelected ? 22 : 18,
                        fontWeight: isSelected ? '600' : '400',
                        color: isSelected ? '#3b82f6' : '#64748b',
                      }}
                    >
                      {state.name} ({state.driverCount})
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Bottom gradient fade */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']}
                style={{ flex: 1 }}
              />
            </View>
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={handleContinue}
            className="active:opacity-80 mb-8"
            disabled={!selectedState}
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
              <Text className="text-white font-bold text-lg">
                View Cities
              </Text>
              <ChevronRight size={24} color="#ffffff" strokeWidth={3} />
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default MapScreen;
