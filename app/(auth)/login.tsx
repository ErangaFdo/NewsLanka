import { loginUser } from "@/service/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState(systemTheme || "light");
  const [isLoading, setIsLoading] = useState(false);

  const isDark = theme === "dark";

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing details",
        text2: "Please enter email and password",
      });
      return;
    }
    setIsLoading(true);
    try {
      await loginUser(email, password);
      Toast.show({
        type: "success",
        text1: "Login successful 🎉",
        text2: "Welcome back!",
      });
      router.replace("/home");
    } catch (e) {
      console.error(e);
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: "Please check your credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#0f172a]" : "bg-white"}`}
    >
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
              Welcome Back
            </Text>
            <Text className="text-slate-500 text-lg mt-2">
              Login to get your daily dose of updates.
            </Text>
          </View>

          {/* Form Section */}
          <View className="px-8 flex-1">
            <View className="space-y-4">
              <View>
                <Text className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Email Address
                </Text>
                <TextInput
                  placeholder="name@company.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94a3b8"
                  className={`rounded-xl border p-4 text-base ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </View>

              <View className="mt-4">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Password
                </Text>
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#94a3b8"
                  className={`rounded-xl border p-4 text-base ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
              className="bg-red-600 py-4 rounded-xl items-center mt-8 shadow-sm"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Sign In</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-10 pb-10">
              <Text className="text-slate-500 text-base">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text className="text-red-600 font-bold text-base">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}