import { Stack, Redirect } from "expo-router"
import { useContext } from "react"
import { AuthContext } from "@/context/authContext"

export default function ServiceProviderLayout() {
  const { user, role, loading } = useContext(AuthContext)

  if (loading) return null

  if (!user || role !== "serviceProvider") {
    return <Redirect href="/" />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}