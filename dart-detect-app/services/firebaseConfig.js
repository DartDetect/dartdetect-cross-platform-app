// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRnWyDIQpeP-Jwr8-HmADkIoORSDKuNss",
  authDomain: "dartdetect-88d33.firebaseapp.com",
  projectId: "dartdetect-88d33",
  storageBucket: "dartdetect-88d33.firebasestorage.app",
  messagingSenderId: "1090343665682",
  appId: "1:1090343665682:web:a9b27fe7a19b6ae56b18cb",
  measurementId: "G-SS1C6QG148"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
//const analytics = getAnalytics(app);