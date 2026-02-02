// import { useLoader } from "@/hooks/useLoader"
import { auth } from "@/service/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { createContext, ReactNode, useEffect, useState } from "react"


interface AuthContextType {
  user: User | null
  loading: boolean
  role: "serviceProvider" | "user" | null
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  role: null
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const { showLoader, hideLoader, isLoading } = useLoader()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<"serviceProvider" | "user" | null>(null)

  useEffect(() => {
    // showLoader()
    const unsucribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr)
      if (usr) {
        // Simulating fetching role from Firestore or another source
        setRole("user") // This would be fetched from Firestore in a real app
      } else {
        setRole(null)
      }
    //   hideLoader()
    })

    return () => unsucribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading: false, role }}>
      {children}
    </AuthContext.Provider>
  )
}