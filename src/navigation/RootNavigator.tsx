import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import type { RootStackParamList } from "@/navigation/types";
import MapScreen from "@/screens/MapScreen";
import CitiesScreen from "@/screens/CitiesScreen";
import DriversScreen from "@/screens/DriversScreen";
import DriverDetailScreen from "@/screens/DriverDetailScreen";
import AdminScreen from "@/screens/AdminScreen";
import DistanceCalculatorScreen from "@/screens/DistanceCalculatorScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <RootStack.Navigator
      initialRouteName="MapScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#f8fafc",
        },
        headerTintColor: "#1e293b",
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerBackVisible: true,
        headerBackTitle: "Back",
        ...(Platform.OS === 'web' && {
          headerLeft: undefined, // Use default back button on web
        }),
      }}
    >
      <RootStack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="CitiesScreen"
        component={CitiesScreen}
        options={{ title: "Cities" }}
      />
      <RootStack.Screen
        name="DriversScreen"
        component={DriversScreen}
        options={{ title: "Drivers" }}
      />
      <RootStack.Screen
        name="DriverDetailScreen"
        component={DriverDetailScreen}
        options={{ title: "Driver Details" }}
      />
      <RootStack.Screen
        name="AdminScreen"
        component={AdminScreen}
        options={{ title: "Admin Dashboard" }}
      />
      <RootStack.Screen
        name="DistanceCalculator"
        component={DistanceCalculatorScreen}
        options={{ headerShown: false }}
      />
    </RootStack.Navigator>
  );
};

export default RootNavigator;
