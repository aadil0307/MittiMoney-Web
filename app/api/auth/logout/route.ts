/**
 * JWT Logout API Route
 * Clears JWT tokens from cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    await clearAuthCookies();

    console.log('[JWT] User logged out, tokens cleared');

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[JWT] Error during logout:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
