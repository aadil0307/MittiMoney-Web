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
 * Verify password and create custom token for sign-in
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

    console.log('[VerifyPassword] Verifying password for:', phoneNumber);

    const auth = getAuth();
    const db = getFirestore();

    // Get user by phone number
    let userRecord;
    try {
      userRecord = await auth.getUserByPhoneNumber(phoneNumber);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'User not found. Please register first.' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Get hashed password from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const hashedPassword = userData?.hashedPassword;

    if (!hashedPassword) {
      return NextResponse.json(
        { error: 'No password set. Please use OTP login or set a password.' },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      console.log('[VerifyPassword] Invalid password for:', phoneNumber);
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    console.log('[VerifyPassword] Password verified successfully');

    // Create custom token for sign-in
    const customToken = await auth.createCustomToken(userRecord.uid);

    return NextResponse.json({
      success: true,
      verified: true,
      customToken,
      uid: userRecord.uid,
      message: 'Password verified successfully',
    });
  } catch (error: any) {
    console.error('[VerifyPassword] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify password', details: error.message },
      { status: 500 }
    );
  }
}
