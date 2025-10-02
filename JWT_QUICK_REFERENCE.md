# JWT Session Management - Quick Reference

## 🚀 Quick Start

### 1. Add JWT Secret to Environment

```bash
# .env.local
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 2. Test Authentication Flow

1. **Login with OTP** → JWT tokens automatically generated
2. **Access Protected Routes** → Tokens verified automatically
3. **Logout** → All tokens cleared

## 📁 File Structure

```
lib/
├── jwt.ts                    # Core JWT utilities
└── auth/
    ├── jwt-middleware.ts     # API route protection
    └── jwt-client.ts         # Client-side utilities

app/api/auth/
├── generate-jwt/route.ts     # Generate tokens
├── refresh-token/route.ts    # Refresh access token
├── logout/route.ts           # Clear tokens
└── verify-otp/route.ts       # Updated with JWT generation

contexts/
└── auth-context.tsx          # Updated with JWT logout
```

## 🔐 Token Configuration

| Token | Lifetime | Storage | Purpose |
|-------|----------|---------|---------|
| Access Token | 15 minutes | HTTP-only cookie | API authentication |
| Refresh Token | 7 days | HTTP-only cookie | Token refresh |

## 💻 Code Examples

### Protect an API Route

```typescript
import { verifyAuthToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const user = await verifyAuthToken();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Process authenticated request
  return NextResponse.json({ userId: user.userId });
}
```

### Client-Side Auth Request

```typescript
import { fetchWithAuth } from '@/lib/auth/jwt-client';

// Auto-refresh on expired token
const response = await fetchWithAuth('/api/my-endpoint', {
  method: 'POST',
  body: JSON.stringify({ data: 'value' }),
});
```

### Logout

```typescript
import { useAuth } from '@/contexts/auth-context';

const { signOut } = useAuth();
await signOut(); // Clears Firebase + JWT tokens
```

## 🔄 Authentication Flow

```
Phone Login → OTP Verify → JWT Generated → Stored in Cookies
                                ↓
                     Access Protected Resources
                                ↓
                    Token Expires? → Auto Refresh
                                ↓
                          Manual Logout
                                ↓
                        Clear All Tokens
```

## 🛡️ Security Features

✅ HTTP-only cookies (XSS protection)
✅ Secure flag in production (HTTPS only)
✅ SameSite: lax (CSRF protection)
✅ Short-lived access tokens (15 min)
✅ Automatic token refresh
✅ Refresh token rotation

## 📋 Testing Checklist

- [ ] JWT_SECRET set in `.env.local`
- [ ] Login flow generates JWT tokens (check logs)
- [ ] Protected route returns 401 without token
- [ ] Protected route works with valid token
- [ ] Token auto-refreshes after 15 minutes
- [ ] Logout clears all tokens
- [ ] After logout, protected routes return 401

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Unauthorized" on all routes | Check JWT_SECRET is set |
| Cookies not being set | Verify secure/sameSite settings |
| Token expires immediately | Check system clock, verify expiration times |
| Refresh fails | Check refresh token in cookies |

## 📊 API Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth/generate-jwt` | POST | Generate tokens | No |
| `/api/auth/refresh-token` | POST | Refresh access token | Refresh token |
| `/api/auth/logout` | POST | Clear tokens | No |
| `/api/protected` | GET/POST | Example protected route | Access token |

## 🔧 Configuration Options

### Change Token Expiration

In `lib/jwt.ts`:

```typescript
const ACCESS_TOKEN_EXPIRY = '30m';  // 30 minutes
const REFRESH_TOKEN_EXPIRY = '14d'; // 14 days
```

### Add Custom Claims

```typescript
const accessToken = await generateAccessToken({
  userId: user.id,
  phoneNumber: user.phone,
  email: user.email,
  role: 'admin',        // Custom claim
  permissions: ['read', 'write'], // Custom claim
});
```

## 📝 Log Messages to Watch

```
[v0] Generating JWT tokens for user: +919876543210
[v0] JWT tokens generated and set in cookies
[JWT] Tokens generated successfully for user: 919876543210
[JWT] Access token refreshed successfully
[JWT Client] Token refreshed successfully
[Auth] JWT tokens cleared
```

## 🎯 Next Steps

1. **Set JWT_SECRET**: Add to `.env.local`
2. **Test Login Flow**: Verify tokens in browser DevTools → Application → Cookies
3. **Protect Routes**: Add JWT verification to sensitive API routes
4. **Monitor Logs**: Watch for JWT generation and verification messages
5. **Test Refresh**: Wait 15 min and verify auto-refresh works

## 📚 Full Documentation

See `JWT_IMPLEMENTATION.md` for comprehensive guide including:
- Detailed architecture
- Security best practices
- Advanced usage examples
- Troubleshooting guide
- Migration instructions

---

**Status**: ✅ JWT session management fully implemented!
**Next**: Add JWT_SECRET to environment and test the flow.
