# 🧪 TESTING GUIDE - Dynamic Onboarding Data

## ✅ The Fix Is Complete!

The dashboard now loads **YOUR actual data** from onboarding instead of showing hardcoded values.

---

## 🎯 Test Now (2 Options)

### Option 1: Test with NEW Phone Number (Recommended)
1. Open: **http://localhost:3000**
2. Click "Sign Out" (if logged in)
3. Register with a **different phone number**
4. Complete all 4 onboarding steps with YOUR values:
   ```
   Step 1: Your Name → e.g., "Aadil Khan"
   Step 2: Income Source → e.g., "Small Business"
   Step 3: Balances:
     - Cash in Hand → e.g., ₹5,000
     - Bank Balance → e.g., ₹15,000
   Step 4: Language → e.g., "Hindi"
   ```
5. **Wait up to 5 seconds** (safety timeout)
6. Dashboard should show YOUR entered values!

### Option 2: Clear Data & Re-onboard (Current Number)
1. Open DevTools (F12)
2. Go to **Application** tab → **Storage** → Click **"Clear site data"**
3. Close DevTools
4. Refresh page (Ctrl + R)
5. Complete onboarding again with YOUR values
6. Verify dashboard shows YOUR data

---

## ✅ What to Verify

After completing onboarding, check:

### Header Section:
- [ ] Shows your actual name: "नमस्ते! [Your Name]"
- [ ] NOT showing: "नमस्ते! Welcome Back"

### Financial Cards:
- [ ] **Cash in Hand** card shows YOUR entered amount (not ₹2,500)
- [ ] **Bank Balance** card shows YOUR entered amount (not ₹8,750)
- [ ] **Total Balance** = YOUR cash + bank (not ₹11,250)

### Console Logs:
Open browser console (F12 → Console tab) and look for:
```
[Onboarding] Saving user profile: { uid: "...", displayName: "...", ... }
[Onboarding] Profile saved successfully
[Dashboard] Loading user profile data: { cashInHand: 5000, bankBalance: 15000, ... }
[Dashboard] Profile loaded - Cash: 5000 Bank: 15000
```

---

## 🎯 Expected Behavior

### Onboarding Flow:
```
1. Enter Name → Shows in form
2. Select Income → Saved for profile
3. Enter Balances → Your actual amounts
4. Choose Language → UI updates immediately
5. Click "Finish" → Shows "Saving your profile..."
6. After max 5 seconds → Success screen → Dashboard
```

### Dashboard Load:
```
1. Shows "Loading your profile..." (brief)
2. Loads data from Firestore
3. Displays YOUR values:
   - Name in header
   - Cash in Hand = your amount
   - Bank Balance = your amount
   - Total Balance = sum of both
```

---

## 🔍 Troubleshooting

### Issue: Dashboard still shows old/wrong values

**Cause:** Old profile data in Firestore

**Solution 1 - New Phone Number:**
- Sign out
- Register with different number
- Complete onboarding
- Should show correct values

**Solution 2 - Firebase Console:**
1. Go to: https://console.firebase.google.com
2. Select your project
3. Go to Firestore Database
4. Find "users" collection
5. Find your document (phone number as ID)
6. Click to edit
7. Update `cashInHand` and `bankBalance` fields
8. Save
9. Hard refresh dashboard (Ctrl + Shift + R)

**Solution 3 - Clear Everything:**
```powershell
# Clear browser data completely:
1. Ctrl + Shift + Delete
2. Select "All time"
3. Check: Cookies, Cache, Site data
4. Click "Clear data"
5. Close and reopen browser
6. Go to http://localhost:3000
7. Complete fresh onboarding
```

---

### Issue: Console shows Firestore 400 errors

**Symptom:** 
```
WebChannelConnection RPC 'Write' stream transport errored
Status 400 (Bad Request)
```

**Solution:** Deploy Firestore security rules
- Follow instructions in `FIX_FIRESTORE_RULES.md`
- Go to Firebase Console → Firestore → Rules
- Publish the rules provided
- Refresh app

---

### Issue: Data shows zero/empty

**Cause:** Profile not loaded yet

**Check:**
1. Open console (F12)
2. Look for `[Dashboard] Loading user profile data: ...`
3. If you see it with null/undefined values → Firestore not saving
4. If you don't see it at all → AuthContext not loading profile

**Solution:**
- Ensure Firestore rules are deployed
- Check Network tab for failed requests
- Verify user is authenticated (see UID in console)

---

## 🚀 After Testing Successfully

Once you confirm:
- ✅ Onboarding saves your data
- ✅ Dashboard loads your data
- ✅ No hardcoded values showing
- ✅ Your name appears in header
- ✅ Your balances show correctly

Then you can:
1. Continue adding transactions (Voice Logger)
2. Set up Savings Jars with YOUR money
3. Track YOUR actual financial situation
4. All features now use YOUR data!

---

## 📞 Your Test Data Example

For reference, here's what you might enter:

```
Step 1: Name
  → Aadil Khan

Step 2: Income Source
  → Small Business / दुकानदार

Step 3: Balances
  → Cash in Hand: ₹5,000
  → Bank Balance: ₹15,000

Step 4: Language
  → हिंदी (Hindi)
```

Dashboard should then show:
```
Header: "नमस्ते! Aadil Khan"
Cash in Hand: ₹5,000
Bank Balance: ₹15,000
Total Balance: ₹20,000
```

---

**Ready to test? Open http://localhost:3000 now!** 🚀
