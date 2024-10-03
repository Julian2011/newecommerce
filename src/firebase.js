// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCm4lMnwWwPipL9oNOIkUoreYE7lPIcPLg",
  authDomain: "fakecommerce-ea430.firebaseapp.com",
  projectId: "fakecommerce-ea430",
  storageBucket: "fakecommerce-ea430.appspot.com",
  messagingSenderId: "164545014220",
  appId: "1:164545014220:web:cb301a5503caf7ceb05569"
};  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

