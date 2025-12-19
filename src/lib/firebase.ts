// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDKtO2AI_EVSnK6XGDuXJNRPrAZkUBl3Qo',
  authDomain: 'aidoc-ze7io.firebaseapp.com',
  projectId: 'aidoc-ze7io',
  storageBucket: 'aidoc-ze7io.appspot.com',
  messagingSenderId: '185704066658',
  appId: '1:185704066658:web:f86ecf5121eb8babe32b3b',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
