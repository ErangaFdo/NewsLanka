import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StatusBar, 
  Alert, 
  useColorScheme,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { registerUser } from "@/service/auth";
import { pickImage } from "@/service/imagePicker";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState(systemTheme || "light");

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const isDark = theme === "dark";

  const handlePickImage = async () => {
    const base64 = await pickImage();
    if (base64) {
      setProfileImage(base64);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: "Please fill all the details",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Password failed",
        text2: "Please check your passwords match",
      });
      return;
    }

    try {
      await registerUser(name, email, password , profileImage || "");
      console.log("Base64 length:", profileImage?.length);
      Toast.show({
        type: "success",
        text1: "Account Created successful 🎉",
        text2: "Please login to continue",
      });
      router.replace("/login");
    } catch (e) {
      console.error(e);
      Toast.show({
        type: "error",
        text1: "Register failed",
        text2: "Please try again",
      });
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-[#0f172a]" : "bg-white"}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View className="px-8 pt-12 pb-6">
            <TouchableOpacity
              onPress={() => setTheme(isDark ? "light" : "dark")}
              className="absolute right-6 top-6"
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={24}
                color={isDark ? "#f8fafc" : "#0f172a"}
              />
            </TouchableOpacity>

            <View className="flex-row items-center mb-2">
              <View className="bg-red-600 px-2 py-1 rounded">
                <Text className="text-white font-bold text-xl tracking-tighter">NEWS</Text>
              </View>
              <Text className={`text-xl font-light ml-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                HUB
              </Text>
            </View>
            
            <Text className={`text-3xl font-bold mt-6 ${isDark ? "text-white" : "text-slate-900"}`}>
              Join the Community
            </Text>
            <Text className="text-slate-500 text-lg mt-2">
              Create an account to stay updated with the latest news.
            </Text>
          </View>

          {/* Form Section */}
          <View className="px-8 flex-1">
            {/* Profile Image Picker */}
            <View className="items-center mb-8">
              <TouchableOpacity 
                onPress={handlePickImage}
                activeOpacity={0.9}
                className={`w-24 h-24 rounded-full border-2 border-dashed items-center justify-center overflow-hidden ${
                  isDark ? "border-slate-700 bg-slate-800" : "border-slate-300 bg-slate-50"
                }`}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${profileImage}` }}
                    className="w-full h-full"
                  />
                ) : (
                  <View className="items-center">
                    <Ionicons name="camera-outline" size={28} color="#dc2626" />
                    <Text className="text-[10px] text-slate-400 mt-1 font-bold">UPLOAD</Text>
                  </View>
                )}
              </TouchableOpacity>
              {profileImage && (
                <TouchableOpacity onPress={handlePickImage} className="mt-2">
                  <Text className="text-red-600 text-xs font-bold">Change Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="space-y-4">
              {/* Full Name */}
              <View className="mb-4">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Full Name
                </Text>
                <TextInput
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor="#94a3b8"
                  className={`rounded-xl border p-4 text-base ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Email Address
                </Text>
                <TextInput
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94a3b8"
                  className={`rounded-xl border p-4 text-base ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </View>

              {/* Password */}
              <View className="mb-4">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Password
                </Text>
                <TextInput
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#94a3b8"
                  className={`rounded-xl border p-4 text-base ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </View>

              {/* Confirm Password */}
              <View className="mb-8">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Confirm Password
                </Text>
                <TextInput
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor="#94a3b8"
                  className={`rounded-xl border p-4 text-base ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              activeOpacity={0.8}
              className="bg-red-600 py-4 rounded-xl items-center shadow-sm"
            >
              <Text className="text-white font-bold text-lg">Create Account</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-10 pb-12">
              <Text className="text-slate-500 text-base">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text className="text-red-600 font-bold text-base">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}