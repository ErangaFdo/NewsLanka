// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvwtLxaUrcEDIQvnEoVYesO7M9ZtEj_y0",
  authDomain: "sewalanka-585bb.firebaseapp.com",
  projectId: "sewalanka-585bb",
  storageBucket: "sewalanka-585bb.firebasestorage.app",
  messagingSenderId: "622065279403",
  appId: "1:622065279403:web:7ee01c54a2b1aa5443b2ee",
  measurementId: "G-28PDJC72TT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);