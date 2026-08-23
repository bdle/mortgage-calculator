import { useState, useEffect } from 'react';
import { auth, db, loginWithGoogle, logoutUser } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    addDoc,
    setDoc,
    doc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

export function useUserProFormas() {
    const [user, setUser] = useState(null);
    const [savedProFormas, setSavedProFormas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Monitor auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Sync pro forma records in real time for logged-in user
    useEffect(() => {
        if (!user) {
            setSavedProFormas([]);
            return;
        }

        const userProFormasRef = collection(db, 'users', user.uid, 'proFormas');
        const q = query(userProFormasRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data()
            }));
            setSavedProFormas(items);
        });

        return () => unsubscribe();
    }, [user]);

    // Save new pro forma
    const saveProForma = async (name, formData) => {
        if (!user) throw new Error('Must be logged in to save');

        // trim the pro forma name before looking it up
        const trimmedName = (name || '').trim() || `Property - ${new Date().toLocaleDateString()}`;
        const userProFormasRef = collection(db, 'users', user.uid, 'proFormas');


        // Check if a pro forma with this exact name already exists
        const q = query(userProFormasRef, where('name', '==', trimmedName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // 1. UPDATE EXISTING ENTRY
            const existingDoc = querySnapshot.docs[0];
            const docRef = doc(db, 'users', user.uid, 'proFormas', existingDoc.id);
            return setDoc(docRef, {
                name: trimmedName,
                data: formData,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } else {
            // 2. CREATE NEW ENTRY
            return addDoc(userProFormasRef, {
                name: trimmedName,
                data: formData,
                createdAt: serverTimestamp()
            });
        }
    };

    // Delete pro forma
    const deleteProForma = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.uid, 'proFormas', id));
    };

    return {
        user,
        loading,
        savedProFormas,
        loginWithGoogle,
        logoutUser,
        saveProForma,
        deleteProForma
    };
}