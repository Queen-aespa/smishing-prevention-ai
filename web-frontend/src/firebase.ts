import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAfIleXrkpPrFElNjky3p7Zwl-3v2npR2A",
  authDomain: "keyboardapp-f2bfb.firebaseapp.com",
  projectId: "keyboardapp-f2bfb",
  storageBucket: "keyboardapp-f2bfb.firebasestorage.app",
  messagingSenderId: "282652266188",
  appId: "1:282652266188:web:602191e43e9f3a74d3bc69"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
