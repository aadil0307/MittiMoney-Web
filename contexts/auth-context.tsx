'use client';

/**
 * Authentication Context for MittiMoney
 * Uses Twilio for OTP verification + Firebase for user management + JWT tokens
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { getAuthInstance, isFirebaseReady } from '@/lib/firebase/config';
import { getUser, createUser } from '@/lib/firebase/firestore';
import type { User } from '@/lib/offline/indexeddb';
import { logout as jwtLogout } from '@/lib/auth/jwt-client';

interface AuthContextType {
  // Current user state
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  
  // Authentication methods
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (phoneNumber: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Helper methods
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  
  // Error state
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    if (!isFirebaseReady()) {
      console.warn('[Auth] Firebase not configured, running in demo mode');
      setLoading(false);
      return;
    }

    const auth = getAuthInstance();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth] Auth state changed:', firebaseUser?.uid || 'No user');
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Load user profile from Firestore (will handle offline gracefully)
          const profile = await getUser(firebaseUser.uid);
          
          if (profile) {
            setUserProfile(profile);
            console.log('[Auth] User profile loaded:', profile.uid);
          } else {
            console.log('[Auth] No profile found, user needs to complete setup');
            setUserProfile(null);
          }
        } catch (error: any) {
          // Don't block on profile load errors
          console.warn('[Auth] Could not load user profile:', error.message);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Send OTP to phone number using Twilio
   */
  const sendOTP = async (
    phoneNumber: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setError(null);
      console.log('[Auth] Sending OTP via Twilio to:', phoneNumber);

      // Format phone number (ensure it starts with +91)
      const formattedPhone = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : phoneNumber.startsWith('91')
        ? `+${phoneNumber}`
        : `+91${phoneNumber}`;

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: formattedPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[Auth] Error sending OTP:', data);
        const errorMessage = data.error || 'Failed to send OTP. Please try again.';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      console.log('[Auth] OTP sent successfully via Twilio');
      return { success: true, message: data.message };
    } catch (error: any) {
      console.error('[Auth] Error sending OTP:', error);
      const errorMessage = 'Failed to send OTP. Please check your connection.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  /**
   * Verify OTP using Twilio and sign in to Firebase
   */
  const verifyOTP = async (
    phoneNumber: string,
    code: string
  ): Promise<void> => {
    try {
      setError(null);
      console.log('[Auth] Verifying OTP code via Twilio');

      // Format phone number
      const formattedPhone = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : phoneNumber.startsWith('91')
        ? `+${phoneNumber}`
        : `+91${phoneNumber}`;

      // Verify OTP with Twilio
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: formattedPhone, 
          otp: code 
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.verified) {
        console.error('[Auth] OTP verification failed:', data);
        const errorMessage = data.error || 'Invalid OTP code. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      console.log('[Auth] OTP verified successfully via Twilio');

      // Get or create custom token from your backend
      const tokenResponse = await fetch('/api/auth/create-custom-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: formattedPhone }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error || 'Failed to get authentication token');
      }

      // Sign in to Firebase with custom token
      if (isFirebaseReady()) {
        const auth = getAuthInstance();
        if (auth && tokenData.customToken) {
          await signInWithCustomToken(auth, tokenData.customToken);
          console.log('[Auth] Signed in to Firebase with custom token');
        } else {
          console.warn('[Auth] Firebase not available, using Twilio-only auth');
          // Store phone number temporarily for user creation
          sessionStorage.setItem('pendingPhoneNumber', formattedPhone);
        }
      }

    } catch (error: any) {
      console.error('[Auth] Error verifying OTP:', error);
      
      let errorMessage = 'Invalid OTP code. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  /**
   * Sign out user (clears both Firebase session and JWT tokens)
   */
  const signOut = async (): Promise<void> => {
    if (!isFirebaseReady()) {
      throw new Error('Firebase not configured');
    }

    const auth = getAuthInstance();
    if (!auth) throw new Error('Auth not initialized');

    try {
      setError(null);
      console.log('[Auth] Signing out user');
      
      // Clear JWT tokens first
      try {
        await jwtLogout();
        console.log('[Auth] JWT tokens cleared');
      } catch (jwtError) {
        console.warn('[Auth] JWT logout failed:', jwtError);
        // Continue with Firebase logout even if JWT fails
      }
      
      // Then sign out from Firebase
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      console.log('[Auth] User signed out successfully');
    } catch (error) {
      console.error('[Auth] Error signing out:', error);
      setError('Failed to sign out. Please try again.');
      throw error;
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    sendOTP,
    verifyOTP,
    signOut,
    isAuthenticated: !!user,
    needsOnboarding: !!user && !userProfile,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Helper function to create user profile after first login
 */
export async function createUserProfile(
  uid: string,
  phoneNumber: string,
  additionalData: Partial<User>
): Promise<void> {
  try {
    const newUser = {
      uid,
      phoneNumber,
      displayName: additionalData.displayName || '',
      preferredLanguage: additionalData.preferredLanguage || 'hi',
      incomeSource: additionalData.incomeSource || '',
      cashInHand: additionalData.cashInHand || 0,
      bankBalance: additionalData.bankBalance || 0,
      voiceGuidanceEnabled: additionalData.voiceGuidanceEnabled ?? true,
      notificationsEnabled: additionalData.notificationsEnabled ?? true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      onboardingCompleted: false,
      walletAddress: additionalData.walletAddress,
    };

    // Create user document in Firestore (id will be auto-generated)
    await createUser(newUser as any);
    console.log('[Auth] User profile created successfully');
  } catch (error) {
    console.error('[Auth] Error creating user profile:', error);
    throw error;
  }
}
