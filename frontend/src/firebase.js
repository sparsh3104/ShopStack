import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - DO NOT CHANGE
const firebaseConfig = {
  apiKey: "AIzaSyARKYbJGqCUPwb8GR1s6JKUHIeyBe2L7Z8",
  authDomain: "shopstack-5351f.firebaseapp.com",
  projectId: "shopstack-5351f",
  storageBucket: "shopstack-5351f.firebasestorage.app",
  messagingSenderId: "512342951833",
  appId: "1:512342951833:web:c9294afe9a52acb81bf508",
  measurementId: "G-KDNDR2N2BX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
