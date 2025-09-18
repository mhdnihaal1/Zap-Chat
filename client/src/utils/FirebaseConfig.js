import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2faMqlq4N4-Mka6BQNCsbV4h_t0uYM2Y",
  authDomain: "zapchat-8de3c.firebaseapp.com",
  projectId: "zapchat-8de3c",
  storageBucket: "zapchat-8de3c.firebasestorage.app",
  messagingSenderId: "189522110832",
  appId: "1:189522110832:web:7a2951842ecb420deb07b5",
  measurementId: "G-0JJEDJYWTY"
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app)