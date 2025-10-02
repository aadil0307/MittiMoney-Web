/**
 * JWT Middleware for Protected Routes
 * Verifies JWT tokens for API route protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, JWTPayload } from '@/lib/jwt';

/**
 * Middleware to verify JWT token
 * Use this in API routes that require authentication
 */
export async function withAuth(
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Verify JWT token from cookies
      const user = await verifyAuthToken();

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or missing authentication token' },
          { status: 401 }
        );
      }

      // Call the handler with the verified user
      return await handler(req, user);
    } catch (error) {
      console.error('[JWT Middleware] Authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

/**
 * Get authenticated user from request
 * Returns null if not authenticated
 */
export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  try {
    return await verifyAuthToken();
  } catch (error) {
    console.error('[JWT Middleware] Error getting auth user:', error);
    return null;
  }
}
