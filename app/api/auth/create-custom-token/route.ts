import { type NextRequest, NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

// Initialize Firebase Admin SDK (only once)
if (!getApps().length) {
  try {
    // Use service account from environment variables
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }

    initializeApp({
      credential: cert(serviceAccount as any),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  } catch (error) {
    console.error('[Admin] Firebase Admin initialization error:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    console.log('[Admin] Creating custom token for:', phoneNumber)

    // Create a unique UID from phone number (remove + and spaces)
    const uid = phoneNumber.replace(/[\+\s]/g, '')

    try {
      // Get or create user in Firebase Auth
      const auth = getAuth()
      let userRecord

      try {
        // Try to get existing user
        userRecord = await auth.getUserByPhoneNumber(phoneNumber)
        console.log('[Admin] Found existing user:', userRecord.uid)
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create new user
          userRecord = await auth.createUser({
            uid,
            phoneNumber,
          })
          console.log('[Admin] Created new user:', userRecord.uid)
        } else {
          throw error
        }
      }

      // Create custom token
      const customToken = await auth.createCustomToken(userRecord.uid)
      console.log('[Admin] Custom token created successfully')

      return NextResponse.json({
        success: true,
        customToken,
        uid: userRecord.uid,
      })
    } catch (error: any) {
      console.error('[Admin] Firebase Auth error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create authentication token',
          details: error.message,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[Admin] Custom token creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
