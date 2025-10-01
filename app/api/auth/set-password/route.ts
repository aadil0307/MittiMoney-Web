import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import bcrypt from 'bcryptjs';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Set password for a user during registration
 * Stores hashed password in Firestore and sets custom claim
 */
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, password } = await request.json();

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: 'Phone number and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    console.log('[SetPassword] Setting password for:', phoneNumber);

    const auth = getAuth();
    const db = getFirestore();

    // Get or create user
    let userRecord;
    try {
      userRecord = await auth.getUserByPhoneNumber(phoneNumber);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create user if doesn't exist
        const uid = phoneNumber.replace(/[\+\s]/g, '');
        userRecord = await auth.createUser({
          uid,
          phoneNumber,
        });
        console.log('[SetPassword] Created new user:', userRecord.uid);
      } else {
        throw error;
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store hashed password in Firestore
    await db.collection('users').doc(userRecord.uid).set(
      {
        phoneNumber,
        hashedPassword,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Set custom claim to indicate user has password
    await auth.setCustomUserClaims(userRecord.uid, { hasPassword: true });

    console.log('[SetPassword] Password set successfully for:', userRecord.uid);

    // Create custom token for immediate sign-in
    const customToken = await auth.createCustomToken(userRecord.uid);

    return NextResponse.json({
      success: true,
      customToken,
      uid: userRecord.uid,
      message: 'Password set successfully',
    });
  } catch (error: any) {
    console.error('[SetPassword] Error:', error);
    return NextResponse.json(
      { error: 'Failed to set password', details: error.message },
      { status: 500 }
    );
  }
}
