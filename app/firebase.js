import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDWlkQxBYzckq__qpHJQM6oc9hNsP19lPE",
    authDomain: "nutra-egypt.firebaseapp.com",
    projectId: "nutra-egypt",
    storageBucket: "nutra-egypt.firebasestorage.app",
    messagingSenderId: "777625343200",
    appId: "1:777625343200:web:1dd4370ab60b0422faac85"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);