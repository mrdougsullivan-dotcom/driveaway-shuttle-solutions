import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, Pressable, Text } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import type { RootStackParamList } from "@/navigation/types";
import MapScreen from "@/screens/MapScreen";
import CitiesScreen from "@/screens/CitiesScreen";
import DriversScreen from "@/screens/DriversScreen";
import DriverDetailScreen from "@/screens/DriverDetailScreen";
import AdminScreen from "@/screens/AdminScreen";
import DistanceCalculatorScreen from "@/screens/DistanceCalculatorScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();

// Custom back button component
const CustomBackButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable 
    onPress={onPress} 
    style={{ 
      flexDirection: 'row', 
      alignItems: 'center',
      paddingRight: 16,
      paddingVertical: 8,
    }}
  >
    <ChevronLeft size={28} color="#ffffff" strokeWidth={2.5} />
    <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '500' }}>Back</Text>
  </Pressable>
);

const RootNavigator = () => {
  return (
    <RootStack.Navigator
      initialRouteName="MapScreen"
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: "#1e293b",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerBackTitleVisible: false,
        headerShadowVisible: true,
        headerLeft: () => (
          <CustomBackButton onPress={() => navigation.goBack()} />
        ),
      })}
    >
      <RootStack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ headerShown: false, headerLeft: () => null }}
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
        options={{ title: "Distance Calculator" }}
      />
    </RootStack.Navigator>
  );
};

export default RootNavigator;
