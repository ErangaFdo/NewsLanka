// import { useLoader } from "@/hooks/useLoader"
import { auth } from "@/service/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { createContext, ReactNode, useEffect, useState } from "react"


interface AuthContextType {
  user: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const { showLoader, hideLoader, isLoading } = useLoader()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // showLoader()
    const unsucribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr)
    //   hideLoader()
    })

    return () => unsucribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading: false }}>
      {children}
    </AuthContext.Provider>
  )
}