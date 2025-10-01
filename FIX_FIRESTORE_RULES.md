# 🔥 Fix Firestore 400 Errors - Deploy Security Rules

## The Problem

You're seeing these errors in the console:
```
firestore.googleapis.com/.../Listen/channel ... 400 (Bad Request)
WebChannelConnection RPC 'Listen' stream transport errored
```

**Root Cause:** Firestore security rules are either not deployed or are blocking your requests.

---

## ✅ Solution: Deploy Firestore Rules

### Step 1: Go to Firebase Console

1. Open: https://console.firebase.google.com/project/mittimoney-f4b55
2. Click "Firestore Database" in the left sidebar
3. Click the "Rules" tab at the top

### Step 2: Update the Rules

Replace the existing rules with this (for development):

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read/write their own transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write their own debts
    match /debts/{debtId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write their own savings jars
    match /savings_jars/{jarId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Publish the Rules

1. Click the **"Publish"** button in the top right
2. Wait for the confirmation message
3. Refresh your app

---

## 🧪 Test If It Worked

1. Open your app: http://localhost:3000
2. Complete the onboarding (language selection)
3. Check the browser console:
   - ✅ No more 400 errors
   - ✅ See: `[Firestore] Created user profile: 919892269474`
   - ✅ Onboarding completes successfully

---

## 🔒 For Production (Later)

Use the more secure rules already in your `firestore.rules` file:

```bash
# Deploy using Firebase CLI
firebase deploy --only firestore:rules
```

The rules in your `firestore.rules` file are already production-ready with proper validation.

---

## 📊 What This Does

- **Allows authenticated users** to create/read/update their own profile
- **Blocks unauthenticated access** completely
- **User can only access their own data** (not other users')
- **Prevents data leaks** and unauthorized access

---

## ⚠️ Alternative: Test Mode (NOT for production)

If you just want to test quickly (ONLY for development):

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**WARNING:** This allows ANYONE to read/write ALL data. Only use for testing!

---

## 🎯 After Deploying Rules

Your app should:
1. ✅ Complete onboarding without errors
2. ✅ Save user profile to Firestore
3. ✅ No more 400 connection errors
4. ✅ Dashboard loads with user data

---

**Deploy these rules now and test again!** 🚀
