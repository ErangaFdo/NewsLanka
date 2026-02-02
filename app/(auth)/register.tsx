import { registerUser } from "@/service/auth"; // ඔයාගේ Firebase service
import { router } from "expo-router"
import { useState } from "react"
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native"
import RNPickerSelect from "react-native-picker-select"; // dropdown එකට

export default function Register() {
  const [fullname, setFullname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"user" | "serviceProvider">("user")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!fullname || !email || !password || !confirmPassword) {
      return Alert.alert("Error", "Please fill all fields")
    }

    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match")
    }

    try {
      setLoading(true)
      const user = await registerUser(fullname, email, password, role)
      setLoading(false)
      Alert.alert("Success", "Account created successfully")
      router.push("/login")
    } catch (error) {
      setLoading(false)
      Alert.alert("Error", (error as any).message || "Something went wrong")
    }
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      {/* Title */}
      <Text className="text-3xl font-bold text-center text-blue-600 mb-2">
        Create Account
      </Text>
      <Text className="text-center text-gray-500 mb-8">
        Join SewaLanka today
      </Text>

      {/* Name */}
      <TextInput
        placeholder="Full Name"
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        value={fullname}
        onChangeText={setFullname}
      />

      {/* Email */}
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password */}
      <TextInput
        placeholder="Password"
        secureTextEntry
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Role Picker */}
      <RNPickerSelect
        onValueChange={(value) => setRole(value)}
        value={role}
        placeholder={{ label: "Select Role", value: null }}
        style={{
          inputIOS: {
            borderWidth: 1,
            borderColor: "#D1D5DB",
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 24,
          },
          inputAndroid: {
            borderWidth: 1,
            borderColor: "#D1D5DB",
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 24,
          },
        }}
        items={[
          { label: "User", value: "user" },
          { label: "Service Provider", value: "serviceProvider" },
        ]}
        
      />

      {/* Register Button */}
      <TouchableOpacity
        className="bg-blue-600 py-4 rounded-xl"
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {loading ? "Registering..." : "Register"}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text className="text-center text-gray-500 mt-6">
        Already have an account?{" "}
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text className="text-blue-900 font-black text-base">Login</Text>
        </TouchableOpacity>
      </Text>
    </View>
  )
}