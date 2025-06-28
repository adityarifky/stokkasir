"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
// In a real app, you'd import the auth object from your firebase config
// import { auth } from '@/lib/firebase';
// import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Mock User type, replace with firebase.User if using Firebase
type User = {
  uid: string;
  email: string | null;
  displayName?: string | null;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a MOCK implementation.
// Replace the logic inside the functions with actual Firebase calls.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mocking auth state persistence
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    // Real implementation with Firebase:
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   setUser(user);
    //   setLoading(false);
    // });
    // return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    // MOCK: Simulate a sign-in
    return new Promise(resolve => {
      setTimeout(() => {
        const mockUser = { uid: '123', email, displayName: 'Pengguna Uji' };
        setUser(mockUser);
        sessionStorage.setItem('user', JSON.stringify(mockUser));
        setLoading(false);
        resolve({ user: mockUser });
      }, 1000);
    });
    // REAL FIREBASE:
    // return signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = async (email: string, pass: string) => {
     setLoading(true);
    // MOCK: Simulate a sign-up
    return new Promise(resolve => {
      setTimeout(() => {
        const mockUser = { uid: '123', email: email, displayName: 'Pengguna Uji' };
        setUser(mockUser);
        sessionStorage.setItem('user', JSON.stringify(mockUser));
        setLoading(false);
        resolve({ user: mockUser });
      }, 1000);
    });
    // REAL FIREBASE:
    // return createUserWithEmailAndPassword(auth, email, pass);
  };

  const signOut = async () => {
    setLoading(true);
    // MOCK: Simulate sign-out
    return new Promise<void>(resolve => {
        setTimeout(() => {
            setUser(null);
            sessionStorage.removeItem('user');
            router.push('/');
            setLoading(false);
            resolve();
        }, 500);
    });
    // REAL FIREBASE:
    // return signOut(auth);
  };

  const value = { user, loading, signIn, signUp, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
