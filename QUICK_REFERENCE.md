# 🚀 MittiMoney Quick Reference Card

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

## Import Statements

```typescript
// Firebase
import { getFirestoreInstance, isFirebaseReady, COLLECTIONS } from '@/lib/firebase/config'
import { createTransaction, addDebtRepayment, addJarDeposit } from '@/lib/firebase/firestore'

// IndexedDB
import { initDB, saveTransaction, getTransactionsByUser } from '@/lib/offline/indexeddb'

// Sync
import { initializeSyncManager, triggerManualSync, getPendingSyncCount } from '@/lib/offline/sync-manager'

// Hooks
import { useTransactions, useDebts, useSavingsJars, useSyncStatus } from '@/hooks/useIndexedDB'

// Context
import { useOffline } from '@/components/offline-manager'
```

## Common Patterns

### Create Transaction (Offline-First)
```typescript
const { addTransaction } = useTransactions(userId)

await addTransaction({
  userId,
  amount: 500,
  type: 'expense',
  category: 'food',
  description: 'Groceries',
  timestamp: new Date(),
  paymentMethod: 'cash',
  syncStatus: 'pending'
})
// Saves to IndexedDB instantly, syncs to Firebase when online
```

### Load User Data
```typescript
const { transactions, loading } = useTransactions(userId)
const { debts } = useDebts(userId)
const { jars } = useSavingsJars(userId)

if (loading) return <Loading />

return (
  <div>
    <h2>Transactions: {transactions.length}</h2>
    <h2>Debts: {debts.length}</h2>
    <h2>Savings Jars: {jars.length}</h2>
  </div>
)
```

### Monitor Sync Status
```typescript
const { isSyncing, pendingItems, lastSyncTime, syncNow } = useSyncStatus()

return (
  <div>
    {isSyncing ? 'Syncing...' : `${pendingItems} pending`}
    <button onClick={syncNow}>Sync Now</button>
    <small>Last sync: {lastSyncTime?.toLocaleString()}</small>
  </div>
)
```

### Check Online/Offline
```typescript
const { isOnline, pendingSync, isReady } = useOffline()

if (!isReady) return <div>Initializing...</div>
if (!isOnline) return <div>Offline Mode - {pendingSync} pending</div>
```

### Add Debt Repayment
```typescript
const { addRepayment } = useDebts(userId)

await addRepayment('debt-123', 5000)
// Auto-updates: remainingAmount, status, paymentHistory
```

### Add Savings Deposit
```typescript
const { addDeposit } = useSavingsJars(userId)

await addDeposit('jar-123', 500)
// Auto-calculates: progress, streaks
```

### Real-Time Listener
```typescript
useEffect(() => {
  if (!isFirebaseReady()) return

  const unsubscribe = subscribeToUserTransactions(userId, (transactions) => {
    console.log('Real-time update:', transactions)
    setTransactions(transactions)
  })

  return () => unsubscribe()
}, [userId])
```

### Manual Firestore Operations
```typescript
// Only use when hooks don't fit your needs

// Check if Firebase is ready
if (!isFirebaseReady()) {
  console.warn('Firebase not configured')
  return
}

// Create
const id = await createTransaction({ userId, amount, ... })

// Read
const transaction = await getTransaction(id)
const userTxs = await getTransactionsByUser(userId, 50)

// Update
await updateTransaction(id, { amount: 600 })

// Delete
await deleteTransaction(id)
```

## Environment Setup

### Development (.env.local)
```bash
# Leave empty for offline-only development
# Or add Firebase config for full features

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Production (.env.production)
```bash
# Required for production deployment
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mittimoney.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mittimoney
# ... rest of config
```

## TypeScript Types

```typescript
import type { User, Transaction, Debt, SavingsJar } from '@/lib/offline/indexeddb'

// User
const user: User = {
  uid: 'user-123',
  phoneNumber: '+919876543210',
  displayName: 'Ramesh Kumar',
  preferredLanguage: 'hi',
  incomeSource: 'Daily wage',
  cashInHand: 2500,
  bankBalance: 8000,
  voiceGuidanceEnabled: true,
  notificationsEnabled: true,
  createdAt: new Date(),
  lastLoginAt: new Date(),
  onboardingCompleted: true
}

// Transaction
const transaction: Transaction = {
  id: 'tx-123',
  userId: 'user-123',
  amount: 500,
  type: 'expense',
  category: 'food',
  description: 'Vegetables',
  timestamp: new Date(),
  paymentMethod: 'cash',
  syncStatus: 'pending'
}

// Debt
const debt: Debt = {
  id: 'debt-123',
  userId: 'user-123',
  name: 'Personal Loan',
  totalAmount: 50000,
  remainingAmount: 30000,
  urgency: 'high',
  status: 'active',
  paymentHistory: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  syncStatus: 'pending'
}

// Savings Jar
const jar: SavingsJar = {
  id: 'jar-123',
  userId: 'user-123',
  name: 'Emergency Fund',
  goal: 'Medical emergencies',
  targetAmount: 10000,
  currentAmount: 3000,
  color: '#4CAF50',
  progress: 30,
  streak: { current: 7, best: 12 },
  milestones: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  syncStatus: 'pending'
}
```

## Debugging

### Console Logs
```typescript
// Check Firebase status
import { getFirebaseStatus } from '@/lib/firebase/config'
console.log(getFirebaseStatus())

// Check IndexedDB stats
import { getDBStats } from '@/lib/offline/indexeddb'
console.log(await getDBStats())

// Check sync queue
import { getSyncQueue } from '@/lib/offline/indexeddb'
console.log(await getSyncQueue())

// Force sync
import { triggerManualSync } from '@/lib/offline/sync-manager'
await triggerManualSync()
```

### Browser DevTools

#### Application Tab
```
IndexedDB → mittimoney-db
├── users
├── transactions
├── debts
├── savings_jars
└── sync_queue  ← Check pending syncs here
```

#### Network Tab
```
Set to "Offline" to test offline functionality
Set to "Slow 3G" to test sync retry logic
```

#### Console
```javascript
// Run test suite
await offlineTests.runAll()

// Individual tests
await offlineTests.testInitDB()
await offlineTests.testSaveTransaction()
await offlineTests.testGetTransactions('user-123')
await offlineTests.testSyncQueue()
await offlineTests.testDBStats()
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "Firestore not configured" | Add Firebase env vars, restart server |
| "Permission denied" | Deploy security rules: `firebase deploy --only firestore:rules` |
| Sync not working | Check `isFirebaseReady()` and `navigator.onLine` |
| Multiple tabs warning | Normal - persistence enabled in first tab only |
| Data not persisting | Check IndexedDB in Application tab |
| Type errors | Ensure all required fields present (paymentMethod, syncStatus, etc.) |

## Performance Tips

```typescript
// ✅ DO: Use hooks for reactive data
const { transactions } = useTransactions(userId)

// ❌ DON'T: Poll Firestore repeatedly
setInterval(() => getTransactionsByUser(userId), 1000)

// ✅ DO: Use real-time listeners
subscribeToUserTransactions(userId, callback)

// ✅ DO: Batch operations
await batchCreateTransactions([tx1, tx2, tx3])

// ❌ DON'T: Individual creates in loop
for (const tx of transactions) {
  await createTransaction(tx) // Slow!
}

// ✅ DO: Query with limits
await getTransactionsByUser(userId, 50)

// ❌ DON'T: Fetch all data
await getTransactionsByUser(userId) // No limit!
```

## Security Rules Patterns

```javascript
// User owns data
match /transactions/{transactionId} {
  allow read, write: if request.auth.uid == resource.data.userId;
}

// Immutable field
match /debts/{debtId} {
  allow update: if request.resource.data.userId == resource.data.userId;
}

// Required fields
match /transactions/{transactionId} {
  allow create: if hasRequiredFields(['userId', 'amount', 'type']);
}

// Public read, restricted write
match /chit_funds/{chitId} {
  allow read: if isAuthenticated();
  allow write: if isAdmin(); // Cloud Function
}
```

## Architecture Layers

```
UI Components
    ↓ (use hooks)
React Hooks (useTransactions, etc.)
    ↓ (call functions)
IndexedDB Layer (local storage)
    ↓ (auto-sync)
Sync Manager (queue processing)
    ↓ (when online)
Firestore Adapter (lib/firebase/firestore.ts)
    ↓ (cloud operations)
Firebase Firestore (cloud storage)
```

## Status Indicators

| Indicator | Meaning |
|-----------|---------|
| `syncStatus: 'pending'` | Saved locally, waiting for sync |
| `syncStatus: 'synced'` | Successfully synced to Firestore |
| `isSyncing: true` | Sync in progress |
| `pendingItems: 3` | 3 operations in sync queue |
| `isOnline: false` | Device offline |
| `isReady: false` | IndexedDB not initialized yet |

## Collection Names

```typescript
import { COLLECTIONS } from '@/lib/firebase/config'

COLLECTIONS.USERS         // 'users'
COLLECTIONS.TRANSACTIONS  // 'transactions'
COLLECTIONS.DEBTS         // 'debts'
COLLECTIONS.SAVINGS_JARS  // 'savings_jars'
COLLECTIONS.CHIT_FUNDS    // 'chit_funds'
COLLECTIONS.NUDGES        // 'nudges'
```

## Support

- 📚 Full docs: `FIREBASE_INTEGRATION.md`
- 🏗️ Architecture: `MITTIMONEY_COMPLETE_ARCHITECTURE.md`
- 🚀 Quick start: `QUICK_START_OFFLINE.md`
- 📝 Version history: `VERSION_2_SUMMARY.md`

---

**Version**: 2.0  
**Status**: Production Ready ✅  
**Last Updated**: January 2025
