/**
 * JWT Refresh Token API Route
 * Refreshes access token using refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    console.log('[JWT] Access token refreshed successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'Access token refreshed successfully',
        expiresIn: 900, // 15 minutes
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[JWT] Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh access token' },
      { status: 500 }
    );
  }
}
