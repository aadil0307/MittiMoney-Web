import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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
 * Check if a user exists by phone number
 * Returns: { exists: boolean, hasPassword: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    console.log('[CheckUser] Checking user:', phoneNumber);

    const auth = getAuth();

    try {
      // Try to get user by phone number
      const userRecord = await auth.getUserByPhoneNumber(phoneNumber);
      
      console.log('[CheckUser] User exists:', userRecord.uid);

      // Check if user has password set (stored in customClaims)
      const hasPassword = userRecord.customClaims?.hasPassword === true;

      return NextResponse.json({
        exists: true,
        hasPassword,
        uid: userRecord.uid,
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log('[CheckUser] User does not exist');
        return NextResponse.json({
          exists: false,
          hasPassword: false,
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('[CheckUser] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check user', details: error.message },
      { status: 500 }
    );
  }
}
