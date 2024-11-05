// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signOut } from 'firebase/auth';
import "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import firebase from "firebase/compat/app";
// Required for side-effects

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "testkey",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "testdomain",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "testid",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "testbucket",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "testmessage",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID | "testapp",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
//const analytics = getAnalytics(app);
const auth = getAuth(app);

// onAuthStateChanged(auth, user => {
//     if(user != null) {
//         console.log('logged in!');
//     } else {
//         console.log('No user');
//     }
// });


export { app, db, auth, signOut };
