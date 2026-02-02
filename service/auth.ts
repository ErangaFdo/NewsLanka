import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import {auth, db } from "./firebase"
import { doc, setDoc } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"


export const registerUser = async (fullname: string, email: string, password: string , role: "serviceProvider" | "user") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    await updateProfile(userCredential.user, {
      displayName: fullname
    })

    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      name: fullname,
      role: role,
      createAt : new Date()
    })

    return userCredential.user
    
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

export const logoutUser = async () => {
  await signOut(auth)
  AsyncStorage.clear()
  return
}

export const loginUser = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
    
    
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
}