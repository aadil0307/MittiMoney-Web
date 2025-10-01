# 🔐 Twilio OTP Authentication Setup Guide

## ✅ What Changed

We've **switched from Firebase Phone Auth to Twilio** to avoid the billing requirement error:
```
FirebaseError: Firebase: Error (auth/billing-not-enabled)
```

### New Authentication Flow:

```
User enters phone → Twilio sends OTP → User enters OTP → Twilio verifies → 
Firebase Admin creates custom token → User signs in to Firebase
```

---

## 🚀 Setup Instructions

### Step 1: Get Twilio Credentials

1. **Sign up for Twilio**: https://www.twilio.com/try-twilio
   - Free trial gives you $15 credit
   - Can send SMS to verified numbers

2. **Get Account SID and Auth Token**:
   - Go to: https://console.twilio.com/
   - Copy **Account SID**
   - Copy **Auth Token** (click "Show" to reveal)

3. **Create Verify Service**:
   - Navigate to: https://console.twilio.com/us1/develop/verify/services
   - Click "Create new Service"
   - Service Name: `MittiMoney OTP`
   - Click "Create"
   - Copy the **Service SID** (starts with `VA...`)

### Step 2: Get Firebase Admin Credentials

1. **Go to Firebase Console**:
   - https://console.firebase.google.com/project/mittimoney-f4b55

2. **Navigate to Service Accounts**:
   - Click ⚙️ (Settings) → Project settings
   - Click "Service accounts" tab
   - Click "Generate new private key"
   - Click "Generate key" in the popup
   - A JSON file will download

3. **Extract from JSON file**:
   - Open the downloaded JSON file
   - Find `client_email` - copy the value
   - Find `private_key` - copy the value (including `\n` characters)

### Step 3: Update .env.local File

Open `c:\Users\aadil\Downloads\mittimoney\.env.local` and update:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcd  # Your Twilio Account SID
TWILIO_AUTH_TOKEN=your_auth_token_here                 # Your Twilio Auth Token
TWILIO_VERIFY_SERVICE_SID=VA1234567890abcdef12345     # Your Verify Service SID

# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@mittimoney-f4b55.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important**: 
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Don't remove the `\n` characters in the private key
- Never commit `.env.local` to git (it's in .gitignore)

### Step 4: Test the Setup

1. **Restart dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Open the app**:
   ```
   http://localhost:3000
   ```

3. **Test OTP flow**:
   - Click "Get Started"
   - Enter a phone number
   - **For Twilio trial**: Phone must be verified in Twilio Console
   - Click "Send OTP"
   - Check SMS on phone
   - Enter 6-digit code
   - Click "Verify"

### Step 5: Verify Phone Numbers (Trial Account)

If using Twilio trial account, you must verify phone numbers first:

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click "Add a new number"
3. Enter phone number with country code: +919876543210
4. Select "SMS" as verification method
5. Enter OTP received on phone
6. Now this number can receive OTP in your app

---

## 🔄 How It Works

### 1. Send OTP (Twilio)
```typescript
// User clicks "Send OTP"
POST /api/auth/send-otp
{
  "phoneNumber": "+919876543210"
}

// Twilio sends SMS with 6-digit code
Response:
{
  "success": true,
  "status": "pending",
  "message": "OTP sent successfully"
}
```

### 2. Verify OTP (Twilio)
```typescript
// User enters OTP code
POST /api/auth/verify-otp
{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}

// Twilio verifies code
Response:
{
  "success": true,
  "verified": true,
  "message": "OTP verified successfully"
}
```

### 3. Get Custom Token (Firebase Admin)
```typescript
// After Twilio verification
POST /api/auth/create-custom-token
{
  "phoneNumber": "+919876543210"
}

// Firebase Admin creates custom token
Response:
{
  "success": true,
  "customToken": "eyJhbGciOiJSUzI1NiIs...",
  "uid": "919876543210"
}
```

### 4. Sign In to Firebase
```typescript
// Client signs in with custom token
signInWithCustomToken(auth, customToken)

// User now authenticated in Firebase
// Can access Firestore with user.uid
```

---

## 📊 Architecture

```
┌─────────────┐
│   Client    │
│ PhoneLogin  │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│   /api/auth/         │
│   send-otp           │ ──────► Twilio Verify API
└──────────────────────┘          (Sends SMS)
       │
       ▼
┌──────────────────────┐
│   User enters OTP    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   /api/auth/         │
│   verify-otp         │ ──────► Twilio Verify API
└──────────────────────┘          (Verifies code)
       │
       ▼
┌──────────────────────┐
│   /api/auth/         │
│   create-custom-     │ ──────► Firebase Admin SDK
│   token              │          (Creates token)
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│   Firebase Auth      │
│   signInWith         │ ──────► Firebase Client SDK
│   CustomToken        │          (Signs in user)
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│   Authenticated!     │
│   Access Firestore   │
└──────────────────────┘
```

---

## 💰 Pricing

### Twilio (OTP SMS)
- **Free Trial**: $15 credit
- **Production**: ~$0.0079 per SMS for India
- **Example**: 1000 verifications = ~$7.90

### Firebase (Free Features Used)
- **Authentication**: Free (no phone auth billing)
- **Firestore**: Free tier (50K reads, 20K writes per day)
- **Hosting**: Free tier (10GB storage, 360MB/day transfer)

---

## 🐛 Troubleshooting

### Error: "Twilio configuration is incomplete"
**Solution**: Check `.env.local` has all 3 Twilio variables set correctly.

### Error: "Phone number is not a valid mobile number"
**Solution**: 
- Use E.164 format: `+919876543210`
- Include country code
- Remove spaces and special characters

### Error: "Authentication failed - check Twilio credentials"
**Solution**: 
- Verify Account SID and Auth Token
- Check they're copied correctly (no extra spaces)
- Try regenerating Auth Token in Twilio Console

### Error: "Failed to initialize Twilio client"
**Solution**: 
- Restart dev server after updating `.env.local`
- Check console for specific error message

### SMS not received (Trial Account)
**Solution**: 
- Verify phone number in Twilio Console first
- Check SMS logs in Twilio Console → Monitor → Logs
- Trial accounts can only send to verified numbers

### Error: "Failed to create authentication token"
**Solution**: 
- Check Firebase Admin credentials in `.env.local`
- Verify `FIREBASE_PRIVATE_KEY` includes `\n` characters
- Make sure quotes are around the private key

---

## ✅ Testing Checklist

- [ ] Twilio credentials added to `.env.local`
- [ ] Firebase Admin credentials added to `.env.local`
- [ ] Dev server restarted
- [ ] Phone number verified in Twilio (for trial)
- [ ] Can enter phone number
- [ ] "Send OTP" button works
- [ ] SMS received on phone
- [ ] Can enter OTP code
- [ ] "Verify" button works
- [ ] Successfully signed in
- [ ] User profile created in Firestore
- [ ] Dashboard loads with user data

---

## 📚 Files Modified

1. ✅ `contexts/auth-context.tsx` - Switched to Twilio OTP
2. ✅ `components/phone-login.tsx` - Removed reCAPTCHA, simplified flow
3. ✅ `app/api/auth/create-custom-token/route.ts` - NEW Firebase Admin endpoint
4. ✅ `.env.local` - Added Twilio + Firebase Admin credentials
5. ✅ `TWILIO_AUTH_SETUP.md` - This guide (NEW)

---

## 🎉 Benefits of Twilio Approach

1. ✅ **No Firebase Billing Required** - Avoids auth/billing-not-enabled error
2. ✅ **More Reliable SMS Delivery** - Twilio is SMS-focused service
3. ✅ **Better Rate Limits** - Twilio has higher SMS quotas
4. ✅ **Detailed Logs** - Better debugging in Twilio Console
5. ✅ **Production Ready** - Twilio is enterprise-grade
6. ✅ **Still Uses Firebase** - For Firestore, user management, etc.

---

## 🔐 Security Notes

1. ✅ OTP codes expire after 10 minutes (Twilio default)
2. ✅ Rate limiting built into Twilio Verify
3. ✅ Custom tokens are single-use and short-lived
4. ✅ Firebase security rules still protect Firestore
5. ✅ All credentials in `.env.local` (not in code)
6. ✅ `.env.local` is gitignored (not committed)

---

## 📞 Support

### Twilio Console
- Main: https://console.twilio.com/
- Verify Services: https://console.twilio.com/us1/develop/verify/services
- SMS Logs: https://console.twilio.com/us1/monitor/logs/sms

### Firebase Console
- Main: https://console.firebase.google.com/project/mittimoney-f4b55
- Authentication: https://console.firebase.google.com/project/mittimoney-f4b55/authentication
- Service Accounts: https://console.firebase.google.com/project/mittimoney-f4b55/settings/serviceaccounts

---

**Ready to test!** Follow the setup steps above and you'll have working OTP authentication without Firebase billing! 🚀
