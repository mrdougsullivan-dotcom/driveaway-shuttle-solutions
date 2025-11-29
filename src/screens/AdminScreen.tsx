import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { type RootStackParamList } from "@/navigation/types";
import { api } from "@/lib/api";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Trash2, Users, MapPin, UserCircle, Car, Camera, Upload } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import AuthGuard from "@/components/AuthGuard";

type Props = NativeStackScreenProps<RootStackParamList, "AdminScreen">;

type Driver = {
  id: string;
  name: string;
  phoneNumber: string | null;
  email: string | null;
  state: string;
  city: string;
  status: "available" | "on_trip" | "offline";
  vehicleType: string | null;
  serviceLocations: string | null;
  notes: string | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type TabType = "drivers" | "users";

const AdminScreen = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState<TabType>("drivers");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDriverForm, setShowAddDriverForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);

  // Driver form state
  const [newDriver, setNewDriver] = useState<{
    name: string;
    phoneNumber: string;
    email: string;
    state: string;
    city: string;
    status: "available" | "on_trip" | "offline";
    vehicleType: string;
    serviceLocations: string;
    notes: string;
  }>({
    name: "",
    phoneNumber: "",
    email: "",
    state: "",
    city: "",
    status: "available",
    vehicleType: "Van",
    serviceLocations: "",
    notes: "",
  });

  // User form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [driversResponse, usersResponse] = await Promise.all([
        api.get<{ drivers: Driver[] }>("/api/drivers"),
        api.get<{ users: User[] }>("/api/users"),
      ]);
      setDrivers(driversResponse.drivers);
      setUsers(usersResponse.users);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Please allow access to your photos to upload contact screenshots.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      extractContactInfo(result.assets[0].uri);
    }
  };

  const extractContactInfo = async (imageUri: string) => {
    setUploadingImage(true);
    try {
      // Create form data with the image
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'contact.jpg',
      } as any);

      // Send to backend for OCR processing
      const response = await fetch(`${process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL}/api/upload/extract-contact`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Check if any data was actually extracted
        const hasExtractedData = data.name || data.phone || data.email || data.city || data.state;

        if (hasExtractedData) {
          // Pre-fill the form with extracted data
          const updates: any = {
            ...newDriver,
          };

          if (data.name) updates.name = data.name;
          if (data.phone) updates.phoneNumber = data.phone;
          if (data.email) updates.email = data.email;
          if (data.city) updates.city = data.city;
          if (data.state) updates.state = data.state;
          if (data.serviceLocations && Array.isArray(data.serviceLocations)) {
            updates.serviceLocations = data.serviceLocations.join(", ");
          }

          setNewDriver(updates);
          Alert.alert("Success!", `${data.message}\n\nExtracted: ${[data.name, data.phone, data.city, data.state].filter(Boolean).join(', ')}`);
        } else {
          Alert.alert("Notice", "Could not extract contact info from image. Please enter manually.");
        }
      } else {
        // Check if it's an API key error
        if (data.error && data.error.includes("API key")) {
          Alert.alert(
            "OCR Setup Required",
            "To use automatic contact extraction, please add your Anthropic API key:\n\n1. Go to the ENV tab in Vibecode\n2. Add ANTHROPIC_API_KEY with your API key from console.anthropic.com\n3. Try uploading again!",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert("Notice", data.message || "Could not extract all info. Please enter manually.");
        }
      }
    } catch (error) {
      console.error("Failed to extract contact info:", error);
      Alert.alert("Notice", "Could not extract contact info. Please enter manually.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.state || !newDriver.city) {
      Alert.alert("Error", "Please fill in name, state, and city");
      return;
    }

    try {
      if (editingDriverId) {
        // Update existing driver
        await api.patch(`/api/drivers/${editingDriverId}`, newDriver);
        Alert.alert("Success", "Driver updated successfully!");
      } else {
        // Add new driver
        await api.post("/api/drivers", newDriver);
        Alert.alert("Success", "Driver added successfully!");
      }

      setShowAddDriverForm(false);
      setEditingDriverId(null);
      setSelectedImage(null);
      setNewDriver({
        name: "",
        phoneNumber: "",
        email: "",
        state: "",
        city: "",
        status: "available" as "available" | "on_trip" | "offline",
        vehicleType: "Van",
        serviceLocations: "",
        notes: "",
      });
      await loadData(); // Refresh data
    } catch (error) {
      Alert.alert("Error", editingDriverId ? "Failed to update driver" : "Failed to add driver");
      console.error(error);
    }
  };

  const handleEditDriver = (driver: Driver) => {
    // Parse service locations back to comma-separated string
    let serviceLocationsStr = "";
    if (driver.serviceLocations) {
      try {
        const locations = JSON.parse(driver.serviceLocations);
        serviceLocationsStr = Array.isArray(locations) ? locations.join(", ") : "";
      } catch (e) {
        serviceLocationsStr = "";
      }
    }

    setNewDriver({
      name: driver.name,
      phoneNumber: driver.phoneNumber || "",
      email: driver.email || "",
      state: driver.state,
      city: driver.city,
      status: driver.status,
      vehicleType: driver.vehicleType || "Van",
      serviceLocations: serviceLocationsStr,
      notes: driver.notes || "",
    });
    setEditingDriverId(driver.id);
    setShowAddDriverForm(true);
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await api.post("/api/users", newUser);
      Alert.alert("Success", "User added successfully!");
      setShowAddUserForm(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
      });
      loadData();
    } catch (error) {
      Alert.alert("Error", "Failed to add user");
      console.error(error);
    }
  };

  const handleDeleteDriver = async (id: string, name: string) => {
    Alert.alert(
      "Delete Driver",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/drivers/${id}`);
              Alert.alert("Success", "Driver deleted");
              loadData();
            } catch (error) {
              Alert.alert("Error", "Failed to delete driver");
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async (id: string, name: string) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/users/${id}`);
              Alert.alert("Success", "User deleted");
              loadData();
            } catch (error) {
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-slate-600 mt-4">Loading admin...</Text>
      </View>
    );
  }

  return (
    <AuthGuard>
      <KeyboardAvoidingView
        className="flex-1 bg-slate-50"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-slate-900 mb-2">
            Admin Dashboard
          </Text>
          <Text className="text-slate-600 text-base">
            Manage drivers and users
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]}
              style={{ borderRadius: 16, padding: 16 }}
            >
              <Car size={24} color="#ffffff" />
              <Text className="text-white text-2xl font-bold mt-2">
                {drivers.length}
              </Text>
              <Text className="text-blue-100 text-sm">Total Drivers</Text>
            </LinearGradient>
          </View>

          <View className="flex-1">
            <LinearGradient
              colors={["#8b5cf6", "#7c3aed"]}
              style={{ borderRadius: 16, padding: 16 }}
            >
              <Users size={24} color="#ffffff" />
              <Text className="text-white text-2xl font-bold mt-2">
                {users.length}
              </Text>
              <Text className="text-purple-100 text-sm">Total Users</Text>
            </LinearGradient>
          </View>

          <View className="flex-1">
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={{ borderRadius: 16, padding: 16 }}
            >
              <MapPin size={24} color="#ffffff" />
              <Text className="text-white text-2xl font-bold mt-2">
                {new Set(drivers.map(d => d.state)).size}
              </Text>
              <Text className="text-green-100 text-sm">States</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-3 mb-6">
          <Pressable
            onPress={() => setActiveTab("drivers")}
            className="flex-1 active:opacity-80"
          >
            <View
              className={`rounded-xl p-4 ${
                activeTab === "drivers" ? "bg-blue-500" : "bg-white"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "drivers" ? "text-white" : "text-slate-700"
                }`}
              >
                Drivers ({drivers.length})
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("users")}
            className="flex-1 active:opacity-80"
          >
            <View
              className={`rounded-xl p-4 ${
                activeTab === "users" ? "bg-blue-500" : "bg-white"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "users" ? "text-white" : "text-slate-700"
                }`}
              >
                Users ({users.length})
              </Text>
            </View>
          </Pressable>
        </View>

        {/* DRIVERS TAB */}
        {activeTab === "drivers" && (
          <>
            {/* Add Driver Button */}
            {!showAddDriverForm && (
              <Pressable
                onPress={() => setShowAddDriverForm(true)}
                className="mb-6 active:opacity-80"
              >
                <LinearGradient
                  colors={["#3b82f6", "#2563eb"]}
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Plus size={24} color="#ffffff" strokeWidth={3} />
                  <Text className="text-white font-bold text-lg">Add Driver</Text>
                </LinearGradient>
              </Pressable>
            )}

            {/* Add/Edit Driver Form */}
            {showAddDriverForm && (
              <View className="bg-white rounded-2xl p-4 mb-6">
                <Text className="text-xl font-bold text-slate-900 mb-4">
                  {editingDriverId ? "Edit Driver" : "Add New Driver"}
                </Text>

                {/* Upload Screenshot Button - Only show for new drivers */}
                {!editingDriverId && (
                  <Pressable
                    onPress={handlePickImage}
                    disabled={uploadingImage}
                    className="mb-4 active:opacity-80"
                  >
                    <View className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-4 items-center">
                      {selectedImage ? (
                        <View className="items-center">
                          <Image
                            source={{ uri: selectedImage }}
                            style={{ width: 100, height: 100, borderRadius: 8 }}
                          />
                          <Text className="text-blue-700 font-semibold mt-2">
                            Screenshot uploaded
                          </Text>
                        </View>
                      ) : (
                        <>
                          {uploadingImage ? (
                            <ActivityIndicator color="#3b82f6" />
                          ) : (
                            <>
                              <Upload size={32} color="#3b82f6" />
                              <Text className="text-blue-700 font-semibold mt-2">
                                Upload Contact Screenshot
                              </Text>
                              <Text className="text-blue-600 text-xs mt-1">
                                Auto-fill name, phone & email
                              </Text>
                            </>
                          )}
                        </>
                      )}
                    </View>
                  </Pressable>
                )}

                <Text className="text-sm font-semibold text-slate-700 mb-1">
                  Name *
                </Text>
                <TextInput
                  placeholder="Enter driver name"
                  value={newDriver.name}
                  onChangeText={(text) => setNewDriver({ ...newDriver, name: text })}
                  className="bg-slate-50 rounded-xl p-3 mb-3 text-slate-900"
                  style={{ outline: 'none' } as any}
                />

                <Text className="text-sm font-semibold text-slate-700 mb-1">
                  Phone Number
                </Text>
                <TextInput
                  placeholder="Enter phone number"
                  value={newDriver.phoneNumber}
                  onChangeText={(text) => setNewDriver({ ...newDriver, phoneNumber: text })}
                  className="bg-slate-50 rounded-xl p-3 mb-3 text-slate-900"
                  keyboardType="phone-pad"
                  style={{ outline: 'none' } as any}
                />

                <Text className="text-sm font-semibold text-slate-700 mb-1">
                  Email
                </Text>
                <TextInput
                  placeholder="Enter email address"
                  value={newDriver.email}
                  onChangeText={(text) => setNewDriver({ ...newDriver, email: text })}
                  className="bg-slate-50 rounded-xl p-3 mb-3 text-slate-900"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ outline: 'none' } as any}
                />

                <Text className="text-sm font-semibold text-slate-700 mb-1">
                  State *
                </Text>
                <TextInput
                  placeholder="VA, Virginia, CA, California, etc."
                  value={newDriver.state}
                  onChangeText={(text) => setNewDriver({ ...newDriver, state: text })}
                  className="bg-slate-50 rounded-xl p-3 mb-3 text-slate-900"
                  autoCapitalize="words"
                  style={{ outline: 'none' } as any}
                />

                <Text className="text-sm font-semibold text-slate-700 mb-1">
                  City *
                </Text>
                <TextInput
                  placeholder="Enter city name"
                  value={newDriver.city}
                  onChangeText={(text) => setNewDriver({ ...newDriver, city: text })}
                  className="bg-slate-50 rounded-xl p-3 mb-3 text-slate-900"
                  style={{ outline: 'none' } as any}
                />

                <Text className="text-sm font-semibold text-slate-700 mb-1">
                  Vehicle Type
                </Text>
                <TextInput
                  placeholder="e.g., Van, SUV, Bus"
                  value={newDriver.vehicleType}
                  onChangeText={(text) => setNewDriver({ ...newDriver, vehicleType: text })}
                  className="bg-slate-50 rounded-xl p-3 mb-3 text-slate-900"
                  style={{ outline: 'none' } as any}
                />

                <Text className="text-sm font-semibold text-slate-700 mb-1">
                  Service Locations
                </Text>
                <Text className="text-xs text-slate-500 mb-1">
                  Cities serviced (comma-separated, e.g., &quot;Houston, TX, Austin, TX, Dallas, TX&quot;)
                </Text>
                <TextInput
                  placeholder="e.g., Houston, TX, Austin, TX"
                  value={newDriver.serviceLocations}
                  onChangeText={(text) => setNewDriver({ ...newDriver, serviceLocations: text })}
                  className="bg-slate-50 rounded-xl p-3 mb-3 text-slate-900"
                  multiline
                  numberOfLines={2}
                  style={{ outline: 'none' } as any}
                />

                <Text className="text-sm font-semibold text-slate-700 mb-1">
                  Notes
                </Text>
                <Text className="text-xs text-slate-500 mb-1">
                  Additional information about this driver
                </Text>
                <TextInput
                  placeholder="e.g., Prefers long-distance trips, Has CDL license, etc."
                  value={newDriver.notes}
                  onChangeText={(text) => setNewDriver({ ...newDriver, notes: text })}
                  className="bg-slate-50 rounded-xl p-3 mb-4 text-slate-900"
                  multiline
                  numberOfLines={3}
                  style={{ outline: 'none' } as any}
                />

                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => {
                      setShowAddDriverForm(false);
                      setEditingDriverId(null);
                      setSelectedImage(null);
                      setNewDriver({
                        name: "",
                        phoneNumber: "",
                        email: "",
                        state: "",
                        city: "",
                        status: "available" as "available" | "on_trip" | "offline",
                        vehicleType: "Van",
                        serviceLocations: "",
                        notes: "",
                      });
                    }}
                    className="flex-1 bg-slate-200 rounded-xl p-3 active:opacity-70"
                  >
                    <Text className="text-slate-700 font-semibold text-center">
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleAddDriver}
                    className="flex-1 active:opacity-80"
                  >
                    <LinearGradient
                      colors={["#3b82f6", "#2563eb"]}
                      style={{ borderRadius: 12, padding: 12 }}
                    >
                      <Text className="text-white font-semibold text-center">
                        {editingDriverId ? "Update Driver" : "Add Driver"}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Drivers List */}
            <Text className="text-xl font-bold text-slate-900 mb-4">
              All Drivers ({drivers.length})
            </Text>

            {drivers.map((driver) => (
              <View
                key={driver.id}
                className="bg-white rounded-2xl p-4 mb-3"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-900">
                      {driver.name}
                    </Text>
                    <Text className="text-sm text-slate-500">
                      {driver.city}, {driver.state}
                    </Text>
                  </View>

                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => handleEditDriver(driver)}
                      className="active:opacity-70"
                    >
                      <View className="bg-blue-50 p-2 rounded-lg">
                        <Car size={20} color="#3b82f6" />
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() => handleDeleteDriver(driver.id, driver.name)}
                      className="active:opacity-70"
                    >
                      <View className="bg-red-50 p-2 rounded-lg">
                        <Trash2 size={20} color="#ef4444" />
                      </View>
                    </Pressable>
                  </View>
                </View>

                {driver.phoneNumber && (
                  <Text className="text-sm text-slate-600 mb-1">
                    📞 {driver.phoneNumber}
                  </Text>
                )}

                {driver.email && (
                  <Text className="text-sm text-slate-600 mb-1">
                    ✉️ {driver.email}
                  </Text>
                )}

                <View className="flex-row items-center gap-2 mt-2">
                  <View
                    className={`px-3 py-1 rounded-full ${
                      driver.status === "available"
                        ? "bg-green-100"
                        : driver.status === "on_trip"
                        ? "bg-amber-100"
                        : "bg-slate-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        driver.status === "available"
                          ? "text-green-700"
                          : driver.status === "on_trip"
                          ? "text-amber-700"
                          : "text-slate-700"
                      }`}
                    >
                      {driver.status.replace("_", " ").toUpperCase()}
                    </Text>
                  </View>

                  {driver.vehicleType && (
                    <View className="px-3 py-1 rounded-full bg-blue-50">
                      <Text className="text-xs font-semibold text-blue-700">
                        {driver.vehicleType}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <>
            {/* Add User Button */}
            {!showAddUserForm && (
              <Pressable
                onPress={() => setShowAddUserForm(true)}
                className="mb-6 active:opacity-80"
              >
                <LinearGradient
                  colors={["#8b5cf6", "#7c3aed"]}
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Plus size={24} color="#ffffff" strokeWidth={3} />
                  <Text className="text-white font-bold text-lg">Add User</Text>
                </LinearGradient>
              </Pressable>
            )}

            {/* Add User Form */}
            {showAddUserForm && (
              <View className="bg-white rounded-2xl p-4 mb-6">
                <Text className="text-xl font-bold text-slate-900 mb-4">
                  Add New User
                </Text>

                <Text className="text-sm font-semibold text-slate-700 mb-1">
                  Name *
                </Text>
                <TextInput
                  placeholder="Enter user name"
                  value={newUser.name}
                  onChangeText={(text) => setNewUser({ ...newUser, name: text })}
                  className="bg-slate-50 rounded-xl p-3 mb-3 text-slate-900"
                  style={{ outline: 'none' } as any}
                />

                <Text className="text-sm font-semibold text-slate-700 mb-1">
                  Email *
                </Text>
                <TextInput
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                  className="bg-slate-50 rounded-xl p-3 mb-3 text-slate-900"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ outline: 'none' } as any}
                />

                <Text className="text-sm font-semibold text-slate-700 mb-1">
                  Password *
                </Text>
                <TextInput
                  placeholder="Enter password"
                  value={newUser.password}
                  onChangeText={(text) => setNewUser({ ...newUser, password: text })}
                  className="bg-slate-50 rounded-xl p-3 mb-4 text-slate-900"
                  secureTextEntry
                  style={{ outline: 'none' } as any}
                />

                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => setShowAddUserForm(false)}
                    className="flex-1 bg-slate-200 rounded-xl p-3 active:opacity-70"
                  >
                    <Text className="text-slate-700 font-semibold text-center">
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleAddUser}
                    className="flex-1 active:opacity-80"
                  >
                    <LinearGradient
                      colors={["#8b5cf6", "#7c3aed"]}
                      style={{ borderRadius: 12, padding: 12 }}
                    >
                      <Text className="text-white font-semibold text-center">
                        Add User
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Users List */}
            <Text className="text-xl font-bold text-slate-900 mb-4">
              All Users ({users.length})
            </Text>

            {users.map((user) => (
              <View
                key={user.id}
                className="bg-white rounded-2xl p-4 mb-3"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
                      <UserCircle size={24} color="#8b5cf6" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-slate-900">
                        {user.name}
                      </Text>
                      <Text className="text-sm text-slate-500">
                        {user.email}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleDeleteUser(user.id, user.name)}
                    className="active:opacity-70"
                  >
                    <View className="bg-red-50 p-2 rounded-lg">
                      <Trash2 size={20} color="#ef4444" />
                    </View>
                  </Pressable>
                </View>

                <Text className="text-xs text-slate-400 mt-2">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </AuthGuard>
  );
};

export default AdminScreen;
