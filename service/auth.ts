import * as WebBrowser from "expo-web-browser";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

WebBrowser.maybeCompleteAuthSession();

export const registerUser = async (
  fullname: string,
  email: string,
  password: string,
  profileImageBase64?: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    const photoURL = "https://via.placeholder.com/150";

    await updateProfile(user, {
      displayName: fullname,
      photoURL: photoURL,
    });

    const userData: any = {
      uid: user.uid,
      name: fullname,
      role: "user",
      photoURL: photoURL,
      createdAt: new Date(),
    };

    // Store base64 image separately if provided
    if (profileImageBase64) {
      userData.profileImageBase64 = profileImageBase64;
    }

    await setDoc(doc(db, "users", user.uid), userData);

    return user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const firebaseGoogleLogin = async (idToken: string) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name: user.displayName || "User",
        email: user.email,
        role: "user",
        photoURL: user.photoURL || "",
        createdAt: new Date(),
      },
      { merge: true },
    );

    return userCredential;
  } catch (error) {
    console.error("Firebase Google login error:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  newName: string,
  newEmail?: string,
  newProfileImageBase64?: string,
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    const photoURL = newProfileImageBase64
      ? `data:image/jpeg;base64,${newProfileImageBase64}`
      : user.photoURL || "";

    await updateProfile(user, {
      displayName: newName,
      photoURL: photoURL,
    });

    if (newEmail && newEmail !== user.email) {
      await updateEmail(user, newEmail);
    }

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      name: newName,
      email: newEmail || user.email,
      photoURL: photoURL,
    });

    return user;
  } catch (error: any) {
    console.error("Error updating profile:", error);
    throw error;
  }
};