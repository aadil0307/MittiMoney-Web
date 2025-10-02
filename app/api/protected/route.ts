/**
 * Example Protected API Route
 * Demonstrates how to use JWT middleware for route protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    // Verify JWT token
    const user = await verifyAuthToken();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login to access this resource' },
        { status: 401 }
      );
    }

    // User is authenticated, return protected data
    return NextResponse.json({
      success: true,
      message: 'Protected data accessed successfully',
      user: {
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Protected Route] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify JWT token
    const user = await verifyAuthToken();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login to access this resource' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // User is authenticated, process the request
    return NextResponse.json({
      success: true,
      message: 'Data processed successfully',
      userId: user.userId,
      data: body,
    });
  } catch (error) {
    console.error('[Protected Route] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
