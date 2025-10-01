# MittiMoney - Enhanced Onboarding Flow

## Overview
This document outlines the enhanced onboarding process that collects comprehensive user data on first registration.

## Onboarding Flow

### New User Registration Flow
```
1. Language Selection (Default: Hindi)
2. Phone Authentication (OTP or Password)
3. Step 1: Personal Information (Name)
4. Step 2: Income Source
5. Step 3: Monthly Income/Salary
6. Step 4: Current Financial Status (Cash + Bank Balance)
7. Step 5: Debt Information (Loans, Credit Cards, Other Debts)
8. Step 6: Savings Goals
9. Step 7: Language Preference Confirmation
10. Success Screen → Dashboard
```

### Returning User Login Flow
```
1. Language Selection
2. Phone Authentication (OTP or Password)
3. → Directly to Dashboard (skip onboarding)
```

## Data Collection Structure

### Step-by-Step Data Collection

#### Step 1: Personal Information
- **Field**: Full Name (`displayName`)
- **Validation**: Required
- **Purpose**: Personalization

#### Step 2: Income Source
- **Field**: Income Source (`incomeSource`)
- **Options**: 
  - Daily Wage (दैनिक मजदूरी)
  - Small Business (छोटा व्यवसाय)
  - Farming (खेती)
  - Driving (ड्राइविंग)
  - Shopkeeper (दुकानदार)
  - Vendor (फेरीवाला)
  - Construction (निर्माण कार्य)
  - Domestic Work (घरेलू काम)
  - Other (अन्य)
- **Validation**: Required
- **Purpose**: Understanding income stability and patterns

#### Step 3: Monthly Income
- **Field**: Monthly Salary/Income (`monthlyIncome`)
- **Type**: Number (₹)
- **Validation**: Must be ≥ 0
- **Purpose**: Budget planning and financial insights

#### Step 4: Current Financial Status
- **Fields**:
  - Cash in Hand (`cashInHand`)
  - Bank Balance (`bankBalance`)
- **Type**: Number (₹)
- **Validation**: Must be ≥ 0
- **Purpose**: Calculate total available funds

#### Step 5: Debt Information
- **Sub-fields**:
  1. **Has Debts?** (`hasDebts`) - Yes/No
  2. **Total Debt Amount** (`totalDebtAmount`) - ₹ (if yes)
  3. **Has Loans?** (`hasLoans`) - Yes/No
  4. **Total Loan Amount** (`totalLoanAmount`) - ₹ (if yes)
  5. **Has Credit Cards?** (`hasCreditCards`) - Yes/No
  6. **Credit Card Debt** (`creditCardDebt`) - ₹ (if yes)
- **Validation**: Amounts must be ≥ 0 if applicable
- **Purpose**: Debt tree visualization and repayment planning

#### Step 6: Savings Goals
- **Field**: Primary Savings Goal (`savingsGoal`)
- **Type**: Text
- **Examples**:
  - House Purchase (घर खरीदना)
  - Marriage (शादी)
  - Education (शिक्षा)
  - Emergency Fund (आपातकालीन फंड)
  - Vehicle (वाहन)
  - Business Expansion (व्यवसाय विस्तार)
- **Validation**: Required
- **Purpose**: Motivate savings and set targets

#### Step 7: Language Preference
- **Field**: Preferred Language (`preferredLanguage`)
- **Options**:
  - हिंदी (Hindi) - **DEFAULT**
  - English
  - मराठी (Marathi)
  - தமிழ் (Tamil)
- **Validation**: Required
- **Purpose**: Localization

## Technical Implementation

### 1. Update User Profile Schema
```typescript
interface User {
  uid: string
  phoneNumber: string
  displayName: string
  
  // Financial Information
  incomeSource: string
  monthlyIncome: number
  cashInHand: number
  bankBalance: number
  
  // Debt Information
  hasDebts: boolean
  totalDebtAmount: number
  hasLoans: boolean
  totalLoanAmount: number
  hasCreditCards: boolean
  creditCardDebt: number
  
  // Goals
  savingsGoal: string
  
  // Preferences
  preferredLanguage: 'hi' | 'mr' | 'ta' | 'en'
  
  // Flags
  onboardingCompleted: boolean
  createdAt: Date
  lastLoginAt: Date
}
```

### 2. Firestore Document Structure
```
users/{userId}
├── displayName: "राजेश कुमार"
├── phoneNumber: "+919876543210"
├── incomeSource: "dailyWage"
├── monthlyIncome: 15000
├── cashInHand: 5000
├── bankBalance: 12000
├── hasDebts: true
├── totalDebtAmount: 50000
├── hasLoans: true
├── totalLoanAmount: 100000
├── hasCreditCards: false
├── creditCardDebt: 0
├── savingsGoal: "घर खरीदना"
├── preferredLanguage: "hi"
├── onboardingCompleted: true
├── createdAt: timestamp
└── lastLoginAt: timestamp
```

### 3. Authentication Flow Logic

```typescript
// In auth-context.tsx
const needsOnboarding = computed(() => {
  return user && userProfile && !userProfile.onboardingCompleted
})

// In app/page.tsx
useEffect(() => {
  if (!authLoading) {
    if (isAuthenticated && user) {
      if (needsOnboarding) {
        setCurrentStep("onboarding") // Show full onboarding
      } else {
        setCurrentStep("dashboard") // Skip to dashboard
      }
    }
  }
}, [isAuthenticated, needsOnboarding])
```

### 4. Component Updates Required

#### File: `components/user-onboarding.tsx`
- Add 3 new steps (Steps 3, 5, 6)
- Update form validation
- Update translations for all languages
- Add conditional rendering for debt fields
- Update total steps from 5 to 8

#### File: `contexts/auth-context.tsx`
- Already has `needsOnboarding` logic ✅
- Ensure it checks `onboardingCompleted` field

#### File: `lib/firebase/firestore.ts`
- Update `createUser` function to accept all new fields
- Ensure `onboardingCompleted: true` is set after completion

## UI/UX Enhancements

### Progress Indicator
```
Step 1/7: Personal Info
Step 2/7: Income Source
Step 3/7: Monthly Income
Step 4/7: Current Money
Step 5/7: Debts & Loans
Step 6/7: Savings Goal
Step 7/7: Language
```

### Visual Design
- Use gradient progress bar showing completion percentage
- Animate transitions between steps
- Show icons for each step type:
  - 👤 Personal
  - 💼 Income
  - 💰 Salary
  - 🏦 Money
  - 💳 Debts
  - 🎯 Goals
  - 🌐 Language

### Success Screen
- Show celebration animation
- Display summary: "आपकी प्रोफाइल पूर्ण हो गई है!"
- Show collected data summary
- Auto-redirect to dashboard after 2 seconds

## Translation Keys to Add

### Hindi (hi)
```typescript
step3Title: "आपकी मासिक आय कितनी है?"
step3Desc: "औसतन हर महीने आप कितना कमाते हैं?"
step5Title: "क्या आप पर कोई कर्ज़ है?"
step5Desc: "अपने कर्ज़ और ऋण के बारे में बताएं"
step6Title: "आपका बचत लक्ष्य क्या है?"
step6Desc: "आप क्यों बचत करना चाहते हैं?"
hasDebtsLabel: "क्या आप पर कर्ज़ है?"
hasLoansLabel: "क्या आपने लोन लिया है?"
hasCreditCardsLabel: "क्या आपके पास क्रेडिट कार्ड है?"
yes: "हाँ"
no: "नहीं"
```

## Testing Checklist

### New User Flow
- [ ] Select language (Hindi by default)
- [ ] Enter phone number and verify OTP
- [ ] Complete Step 1: Enter name
- [ ] Complete Step 2: Select income source
- [ ] Complete Step 3: Enter monthly income
- [ ] Complete Step 4: Enter cash and bank balance
- [ ] Complete Step 5: Enter debt information
- [ ] Complete Step 6: Enter savings goal
- [ ] Complete Step 7: Confirm language
- [ ] See success screen
- [ ] Redirect to dashboard
- [ ] Verify all data saved in Firestore

### Returning User Flow
- [ ] Select language
- [ ] Enter phone number and verify OTP
- [ ] **Should skip directly to dashboard**
- [ ] Verify no onboarding shown
- [ ] Verify user data loads correctly

### Validation Testing
- [ ] Cannot proceed without required fields
- [ ] Amount fields reject negative values
- [ ] Conditional debt fields show/hide correctly
- [ ] Back button works on all steps
- [ ] Error messages display in selected language

## Benefits of Enhanced Onboarding

1. **Better Financial Insights**: Comprehensive data enables personalized recommendations
2. **Accurate Debt Management**: Debt tree can visualize real user debts from day 1
3. **Targeted Savings**: Know user goals to provide relevant savings jar suggestions
4. **Income-Based Features**: Adjust recommendations based on income stability
5. **Complete User Profile**: No need for users to manually enter data later

## Implementation Priority

1. ✅ **Phase 1**: Update data structures and types
2. 🔄 **Phase 2**: Add new onboarding steps (IN PROGRESS)
3. ⏳ **Phase 3**: Update authentication flow
4. ⏳ **Phase 4**: Test and validate
5. ⏳ **Phase 5**: Deploy and monitor

---

**Note**: Default language should be **Hindi (हिंदी)** as specified, but users can change to English, Marathi, or Tamil.
