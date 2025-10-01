/**
 * Firebase Configuration for MittiMoney
 * Initializes Firebase app with Firestore, Auth, and offline persistence
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  enableIndexedDbPersistence,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
function validateConfig() {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter(
    key => !firebaseConfig[key as keyof typeof firebaseConfig]
  );

  if (missingKeys.length > 0) {
    console.warn(
      `[Firebase] Missing configuration keys: ${missingKeys.join(', ')}\n` +
      'Using demo mode. Set environment variables for production.'
    );
    return false;
  }

  return true;
}

// Initialize Firebase App
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Flag to check if Firebase is properly configured
export let isFirebaseConfigured = false;

if (typeof window !== 'undefined') {
  // Client-side initialization
  isFirebaseConfigured = validateConfig();

  if (isFirebaseConfigured) {
    try {
      // Initialize app if not already initialized
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log('[Firebase] App initialized successfully');
      } else {
        app = getApps()[0];
        console.log('[Firebase] Using existing app instance');
      }

      // Initialize Auth
      auth = getAuth(app);
      console.log('[Firebase] Auth initialized');

      // Initialize Firestore with custom settings
      try {
        db = initializeFirestore(app, {
          cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        });
        console.log('[Firebase] Firestore initialized');

        // Enable offline persistence (non-blocking)
        enableIndexedDbPersistence(db, {
          forceOwnership: false, // Allow multiple tabs
        })
          .then(() => {
            console.log('[Firebase] Offline persistence enabled');
          })
          .catch((err) => {
            if (err.code === 'failed-precondition') {
              console.warn(
                '[Firebase] Multiple tabs open, persistence enabled in first tab only'
              );
            } else if (err.code === 'unimplemented') {
              console.warn('[Firebase] Browser does not support offline persistence');
            } else {
              console.warn('[Firebase] Failed to enable persistence:', err.message);
              // Don't fail initialization if persistence fails
            }
          });
      } catch (error: any) {
        console.error('[Firebase] Firestore initialization error:', error.message);
        // Try with default Firestore if custom initialization fails
        db = getFirestore(app);
        console.log('[Firebase] Using default Firestore instance');
      }
    } catch (error) {
      console.error('[Firebase] Initialization error:', error);
      isFirebaseConfigured = false;
    }
  } else {
    console.log('[Firebase] Running in demo mode - no cloud sync');
  }
}

// Export Firebase instances
export { app, auth, db };

/**
 * Get Firestore instance (safe to use in components)
 */
export function getFirestoreInstance(): Firestore | null {
  if (!isFirebaseConfigured) {
    console.warn('[Firebase] Firestore not configured, returning null');
    return null;
  }
  return db;
}

/**
 * Get Auth instance (safe to use in components)
 */
export function getAuthInstance(): Auth | null {
  if (!isFirebaseConfigured) {
    console.warn('[Firebase] Auth not configured, returning null');
    return null;
  }
  return auth;
}

/**
 * Check if Firebase is ready for use
 */
export function isFirebaseReady(): boolean {
  return isFirebaseConfigured && !!app && !!auth && !!db;
}

/**
 * Collection names as constants
 */
export const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  DEBTS: 'debts',
  SAVINGS_JARS: 'savings_jars',
  CHIT_FUNDS: 'chit_funds',
  NUDGES: 'nudges',
} as const;

/**
 * Firebase configuration status for debugging
 */
export function getFirebaseStatus() {
  return {
    configured: isFirebaseConfigured,
    hasApp: !!app,
    hasAuth: !!auth,
    hasFirestore: !!db,
    projectId: firebaseConfig.projectId || 'Not configured',
  };
}
