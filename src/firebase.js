// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkYup8Xf2xK4ALmaL030BRz0E06xWxNBQ",
  authDomain: "viewminder-1dc1c.firebaseapp.com",
  projectId: "viewminder-1dc1c",
  storageBucket: "viewminder-1dc1c.firebasestorage.app",
  messagingSenderId: "760498451674",
  appId: "1:760498451674:web:2fa41266a96b6d41b0e1e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { app, db, storage, firebaseConfig };
