/**
 * JWT Generation API Route
 * Generates JWT tokens after successful OTP verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { userId, phoneNumber, email, role } = await req.json();

    // Validate required fields
    if (!userId || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and phoneNumber' },
        { status: 400 }
      );
    }

    // Generate tokens
    const accessToken = await generateAccessToken({
      userId,
      phoneNumber,
      email,
      role: role || 'user',
    });

    const refreshToken = await generateRefreshToken({
      userId,
      phoneNumber,
      email,
      role: role || 'user',
    });

    // Set tokens in HTTP-only cookies
    await setAuthCookies(accessToken, refreshToken);

    console.log('[JWT] Tokens generated successfully for user:', userId);

    return NextResponse.json(
      {
        success: true,
        message: 'JWT tokens generated successfully',
        expiresIn: 900, // 15 minutes in seconds
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[JWT] Error generating tokens:', error);
    return NextResponse.json(
      { error: 'Failed to generate JWT tokens' },
      { status: 500 }
    );
  }
}
