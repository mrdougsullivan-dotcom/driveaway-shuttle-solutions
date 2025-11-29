import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useSession } from "@/lib/useSession";
import { LinearGradient } from "expo-linear-gradient";
import { Lock } from "lucide-react-native";
import LoginWithEmailPassword from "@/components/LoginWithEmailPassword";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

/**
 * AuthGuard component - protects screens from unauthorized access
 * Displays login form if user is not authenticated
 */
export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { data: session, isPending } = useSession();
  const [showLogin, setShowLogin] = useState(false);

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-slate-600 mt-4">Checking authentication...</Text>
      </View>
    );
  }

  // Show login screen if not authenticated
  if (!session?.user) {
    return (
      <View className="flex-1 bg-slate-50">
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          style={{ flex: 1 }}
        >
          <View className="flex-1 items-center justify-center p-6">
            <View className="bg-white rounded-full p-6 mb-6">
              <Lock size={48} color="#3b82f6" />
            </View>
            
            <Text className="text-white text-3xl font-bold mb-3 text-center">
              Authentication Required
            </Text>
            
            <Text className="text-blue-100 text-lg mb-8 text-center">
              Please sign in to access this area
            </Text>

            {!showLogin ? (
              <Pressable
                onPress={() => setShowLogin(true)}
                className="active:opacity-80"
              >
                <View className="bg-white px-8 py-4 rounded-2xl">
                  <Text className="text-blue-600 font-bold text-lg">
                    Sign In
                  </Text>
                </View>
              </Pressable>
            ) : (
              <View className="w-full max-w-md">
                <LoginWithEmailPassword />
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  }

  // User is authenticated - render protected content
  return <>{children}</>;
}




