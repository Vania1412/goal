// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

import 'firebase/firestore';
import 'firebase/storage';


/*const firebaseConfig = {
    apiKey: "AIzaSyDt9p7b8cmcUI7RgSwxC_JBxpbdp3L1joU",
    authDomain: "saving-goal-1e180.firebaseapp.com",
    projectId: "saving-goal-1e180",
    storageBucket: "saving-goal-1e180.appspot.com",
    messagingSenderId: "472859181501",
    appId: "1:472859181501:android:7e5fd23b77ca0b05fd52d4",
};*/

const firebaseConfig = {
    apiKey: "AIzaSyAt0eRb_fpMx8HgvlqhHYD2WhbjS9nFZcQ",
    authDomain: "saving-goal-1e180.firebaseapp.com",
    projectId: "saving-goal-1e180",
    storageBucket: "saving-goal-1e180.appspot.com",
    messagingSenderId: "472859181501",
    appId: "1:472859181501:web:36df775371b082c7fd52d4",
    measurementId: "G-JM8Z1W6LX9"
  };

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
const db = getFirestore(app);
export const storage = getStorage(app);
const auth = getAuth(app);

export { db, auth };
