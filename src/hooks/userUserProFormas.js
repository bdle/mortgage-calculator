import { useState, useEffect } from 'react';
import { auth, db, loginWithGoogle, logoutUser } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
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
        const userProFormasRef = collection(db, 'users', user.uid, 'proFormas');
        return addDoc(userProFormasRef, {
            name: name || `Property - ${new Date().toLocaleDateString()}`,
            data: formData,
            createdAt: serverTimestamp()
        });
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