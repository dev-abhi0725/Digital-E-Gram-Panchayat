import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

//  Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBb663mMO30IAdb1URZcTQlgcRqwKvn1nQ",
  authDomain: "e-gram-panchayat-a480e.firebaseapp.com",
  projectId: "e-gram-panchayat-a480e",
  storageBucket: "e-gram-panchayat-a480e.firebasestorage.app",
  messagingSenderId: "817145440234",
  appId: "1:817145440234:web:ca1ddd70a0935695707493",
  measurementId: "G-RNLGPZ9JB8"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
