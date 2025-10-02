/**
 * JWT Utility Functions for MittiMoney
 * Handles JWT token generation, verification, and refresh
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Secret key for JWT signing - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  email?: string;
  role?: string;
  type?: string;
  iat?: number;
  exp?: number;
  sub?: string;
}

/**
 * Generate JWT access token
 */
export async function generateAccessToken(payload: JWTPayload): Promise<string> {
  try {
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRY)
      .setSubject(payload.userId)
      .sign(JWT_SECRET_KEY);

    return token;
  } catch (error) {
    console.error('[JWT] Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
}

/**
 * Generate JWT refresh token
 */
export async function generateRefreshToken(payload: JWTPayload): Promise<string> {
  try {
    const token = await new SignJWT({ ...payload, type: 'refresh' })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .setSubject(payload.userId)
      .sign(JWT_SECRET_KEY);

    return token;
  } catch (error) {
    console.error('[JWT] Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY, {
      algorithms: ['HS256'],
    });

    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('[JWT] Token verification failed:', error);
    return null;
  }
}

/**
 * Set JWT tokens in HTTP-only cookies
 */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  // Set access token cookie (15 minutes)
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes in seconds
    path: '/',
  });

  // Set refresh token cookie (7 days)
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  });
}

/**
 * Get JWT tokens from cookies
 */
export async function getAuthTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  const cookieStore = await cookies();
  
  const accessToken = cookieStore.get('accessToken')?.value || null;
  const refreshToken = cookieStore.get('refreshToken')?.value || null;

  return { accessToken, refreshToken };
}

/**
 * Clear auth cookies (logout)
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}

/**
 * Verify auth token from request
 */
export async function verifyAuthToken(): Promise<JWTPayload | null> {
  const { accessToken } = await getAuthTokens();
  
  if (!accessToken) {
    return null;
  }

  return await verifyToken(accessToken);
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = await getAuthTokens();
  
  if (!refreshToken) {
    return null;
  }

  const payload = await verifyToken(refreshToken);
  
  if (!payload || payload.type !== 'refresh') {
    return null;
  }

  // Generate new access token
  const newAccessToken = await generateAccessToken({
    userId: payload.userId,
    phoneNumber: payload.phoneNumber,
    email: payload.email,
    role: payload.role,
  });

  // Update access token cookie
  const cookieStore = await cookies();
  cookieStore.set('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  });

  return newAccessToken;
}
