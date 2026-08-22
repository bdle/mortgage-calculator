import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAzZpfUm2ql0kNZr3rn4o5MgsLVuh1oC4Q",
    authDomain: "mortgage-calculator-cb33f.firebaseapp.com",
    projectId: "mortgage-calculator-cb33f",
    storageBucket: "mortgage-calculator-cb33f.firebasestorage.app",
    messagingSenderId: "207057103469",
    appId: "1:207057103469:web:9c4426c46b99029dbe6d64",
    measurementId: "G-WPJGW4RMRK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logoutUser = () => signOut(auth);