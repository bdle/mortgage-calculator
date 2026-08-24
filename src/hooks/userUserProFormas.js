// src/hooks/useUserProFormas.js
import { useState, useEffect, useCallback } from 'react';
import { auth, loginWithGoogle, logoutUser } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export function useUserProFormas() {
    const [user, setUser] = useState(null);
    const [savedProFormas, setSavedProFormas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper to fetch auth headers with ID token
    const getAuthHeaders = async () => {
        if (!auth.currentUser) throw new Error('Not authenticated');
        const token = await auth.currentUser.getIdToken(true);
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    };

    // Fetch pro formas from Micro API
    const fetchProFormas = useCallback(async () => {
        if (!auth.currentUser) return;
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/proformas`, { headers });
            const data = await res.json();
            setSavedProFormas(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load pro formas:', err);
        }
    }, []);

    // Monitor auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                await fetchProFormas();
            } else {
                setSavedProFormas([]);
            }
        });
        return () => unsubscribe();
    }, [fetchProFormas]);

    // Save/Update pro forma via API
    const saveProForma = async (name, formData) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/proformas`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name, data: formData }),
        });
        if (!res.ok) throw new Error('Failed to save pro forma');
        await fetchProFormas();
    };

    // Delete pro forma via API
    const deleteProForma = async (id) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/proformas/${id}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) throw new Error('Failed to delete pro forma');
        await fetchProFormas();
    };

    return {
        user,
        loading,
        savedProFormas,
        loginWithGoogle,
        logoutUser,
        saveProForma,
        deleteProForma,
    };
}