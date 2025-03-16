// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5-TV-gqCSdTCYTrkWe4-ejpO6xIXpRh8",
  authDomain: "studio-privato-fd51a.firebaseapp.com",
  projectId: "studio-privato-fd51a",
  storageBucket: "studio-privato-fd51a.firebasestorage.app",
  messagingSenderId: "486549623319",
  appId: "1:486549623319:web:49e98e4cc8e7c819e04252",
  measurementId: "G-2ZLBCYD5G7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Aggiungi Firestore

export { auth, db };