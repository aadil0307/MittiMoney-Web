/**
 * Client-side JWT Token Management Utilities
 * Handles JWT token operations from the client side
 */

/**
 * Refresh the access token
 */
export async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[JWT Client] Token refresh failed:', response.statusText);
      return false;
    }

    const data = await response.json();
    console.log('[JWT Client] Token refreshed successfully');
    return data.success;
  } catch (error) {
    console.error('[JWT Client] Error refreshing token:', error);
    return false;
  }
}

/**
 * Logout user and clear JWT tokens
 */
export async function logout(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[JWT Client] Logout failed:', response.statusText);
      return false;
    }

    const data = await response.json();
    console.log('[JWT Client] Logged out successfully');
    return data.success;
  } catch (error) {
    console.error('[JWT Client] Error during logout:', error);
    return false;
  }
}

/**
 * Check if user is authenticated (has valid tokens)
 * This is a client-side check only
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    // Make a test request to a protected endpoint
    // For now, we'll use the refresh token endpoint as a test
    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('[JWT Client] Authentication check failed:', error);
    return false;
  }
}

/**
 * Fetch with automatic token refresh
 * Wraps fetch to automatically refresh expired tokens
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    let response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies
    });

    // If unauthorized, try refreshing the token
    if (response.status === 401) {
      console.log('[JWT Client] Token expired, attempting refresh...');
      const refreshed = await refreshToken();

      if (refreshed) {
        // Retry the original request
        response = await fetch(url, {
          ...options,
          credentials: 'include',
        });
      } else {
        console.error('[JWT Client] Token refresh failed, redirecting to login');
        // Redirect to login or handle as needed
        window.location.href = '/';
      }
    }

    return response;
  } catch (error) {
    console.error('[JWT Client] Fetch with auth error:', error);
    throw error;
  }
}
