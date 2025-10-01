/**
 * Firestore Data Layer for MittiMoney
 * CRUD operations for all collections with TypeScript types
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirestoreInstance, COLLECTIONS, isFirebaseReady } from './config';
import type {
  Transaction,
  Debt,
  SavingsJar,
  User,
} from '@/lib/offline/indexeddb';

/**
 * Generic Firestore operations
 */

export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const db = getFirestoreInstance();
  if (!db) {
    console.warn('[Firestore] Not configured, using temporary ID');
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`[Firestore] Created document in ${collectionName}:`, docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error(`[Firestore] Error creating document in ${collectionName}:`, error.message);
    throw error;
  }
}

export async function getDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  const db = getFirestoreInstance();
  if (!db) {
    console.warn('[Firestore] Not configured, returning null');
    return null;
  }

  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as T;
    }

    return null;
  } catch (error: any) {
    // Silently handle offline errors - data will sync when online
    if (error.message?.includes('client is offline')) {
      console.warn(`[Firestore] Offline - will retry when connection restored`);
      return null;
    }
    console.error(`[Firestore] Error getting document from ${collectionName}:`, error.message);
    return null;
  }
}

export async function updateDocument<T extends Partial<DocumentData>>(
  collectionName: string,
  documentId: string,
  data: T
): Promise<void> {
  const db = getFirestoreInstance();
  if (!db) {
    console.warn('[Firestore] Not configured, update skipped');
    return;
  }

  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    console.log(`[Firestore] Updated document in ${collectionName}:`, documentId);
  } catch (error: any) {
    console.error(`[Firestore] Error updating document in ${collectionName}:`, error.message);
    throw error;
  }
}

export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  const db = getFirestoreInstance();
  if (!db) throw new Error('Firestore not configured');

  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);

  console.log(`[Firestore] Deleted document in ${collectionName}:`, documentId);
}

export async function queryDocuments<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[]
): Promise<T[]> {
  const db = getFirestoreInstance();
  if (!db) throw new Error('Firestore not configured');

  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as unknown as T[];
}

/**
 * User Operations
 */

export async function createUser(user: any): Promise<string> {
  const db = getFirestoreInstance();
  if (!db) {
    console.warn('[Firestore] Not configured, skipping user creation');
    return user.uid || 'temp_user';
  }

  try {
    const userId = user.uid;
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`[Firestore] Created user profile:`, userId);
    return userId;
  } catch (error: any) {
    console.error(`[Firestore] Error creating user:`, error.message);
    throw error;
  }
}

export async function getUser(userId: string): Promise<User | null> {
  return getDocument<User>(COLLECTIONS.USERS, userId);
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<void> {
  return updateDocument(COLLECTIONS.USERS, userId, updates);
}

/**
 * Transaction Operations
 */

export async function createTransaction(
  transaction: Omit<Transaction, 'id'>
): Promise<string> {
  return createDocument(COLLECTIONS.TRANSACTIONS, transaction);
}

export async function getTransaction(
  transactionId: string
): Promise<Transaction | null> {
  return getDocument<Transaction>(COLLECTIONS.TRANSACTIONS, transactionId);
}

export async function getTransactionsByUser(
  userId: string,
  limitCount?: number
): Promise<Transaction[]> {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
  ];

  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  return queryDocuments<Transaction>(COLLECTIONS.TRANSACTIONS, constraints);
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<Transaction>
): Promise<void> {
  return updateDocument(COLLECTIONS.TRANSACTIONS, transactionId, updates);
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  return deleteDocument(COLLECTIONS.TRANSACTIONS, transactionId);
}

/**
 * Get pending (unsynced) transactions
 */
export async function getPendingTransactions(
  userId: string
): Promise<Transaction[]> {
  return queryDocuments<Transaction>(COLLECTIONS.TRANSACTIONS, [
    where('userId', '==', userId),
    where('synced', '==', false),
  ]);
}

/**
 * Debt Operations
 */

export async function createDebt(debt: Omit<Debt, 'id'>): Promise<string> {
  return createDocument(COLLECTIONS.DEBTS, debt);
}

export async function getDebt(debtId: string): Promise<Debt | null> {
  return getDocument<Debt>(COLLECTIONS.DEBTS, debtId);
}

export async function getDebtsByUser(userId: string): Promise<Debt[]> {
  return queryDocuments<Debt>(COLLECTIONS.DEBTS, [
    where('userId', '==', userId),
    where('status', '==', 'active'),
    orderBy('timestamp', 'desc'),
  ]);
}

export async function updateDebt(
  debtId: string,
  updates: Partial<Debt>
): Promise<void> {
  return updateDocument(COLLECTIONS.DEBTS, debtId, updates);
}

export async function addDebtRepayment(
  debtId: string,
  amount: number
): Promise<void> {
  const db = getFirestoreInstance();
  if (!db) throw new Error('Firestore not configured');

  const debt = await getDebt(debtId);
  if (!debt) throw new Error('Debt not found');

  const currentRepaid = debt.totalAmount - debt.remainingAmount;
  const newRepaidAmount = currentRepaid + amount;
  const newRemainingAmount = debt.totalAmount - newRepaidAmount;
  const newStatus = newRemainingAmount <= 0 ? 'paid_off' : 'active';

  const repayment = {
    amount,
    date: new Date(),
    note: `Payment of ₹${amount}`,
  };

  await updateDebt(debtId, {
    remainingAmount: Math.max(0, newRemainingAmount),
    status: newStatus,
    paymentHistory: [...(debt.paymentHistory || []), repayment],
    lastPaymentDate: new Date(),
  });

  console.log(`[Firestore] Added repayment to debt ${debtId}:`, amount);
}

export async function deleteDebt(debtId: string): Promise<void> {
  return deleteDocument(COLLECTIONS.DEBTS, debtId);
}

/**
 * Savings Jar Operations
 */

export async function createSavingsJar(
  jar: Omit<SavingsJar, 'id'>
): Promise<string> {
  return createDocument(COLLECTIONS.SAVINGS_JARS, jar);
}

export async function getSavingsJar(jarId: string): Promise<SavingsJar | null> {
  return getDocument<SavingsJar>(COLLECTIONS.SAVINGS_JARS, jarId);
}

export async function getSavingsJarsByUser(
  userId: string
): Promise<SavingsJar[]> {
  return queryDocuments<SavingsJar>(COLLECTIONS.SAVINGS_JARS, [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  ]);
}

export async function updateSavingsJar(
  jarId: string,
  updates: Partial<SavingsJar>
): Promise<void> {
  return updateDocument(COLLECTIONS.SAVINGS_JARS, jarId, updates);
}

export async function addJarDeposit(
  jarId: string,
  amount: number
): Promise<void> {
  const jar = await getSavingsJar(jarId);
  if (!jar) throw new Error('Savings jar not found');

  const newCurrentAmount = jar.currentAmount + amount;
  const newProgress = (newCurrentAmount / jar.targetAmount) * 100;

  // Calculate streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastSaved = jar.lastSavedDate ? new Date(jar.lastSavedDate) : null;
  let newStreak = jar.streak || { current: 0, best: 0 };

  if (lastSaved) {
    const lastSavedDay = new Date(lastSaved);
    lastSavedDay.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor(
      (today.getTime() - lastSavedDay.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Consecutive day
      newStreak = {
        current: newStreak.current + 1,
        best: Math.max(newStreak.best, newStreak.current + 1),
      };
    } else if (daysDiff > 1) {
      // Streak broken
      newStreak = {
        current: 1,
        best: Math.max(newStreak.best, 1),
      };
    }
    // daysDiff === 0 means same day, keep streak as is
  } else {
    // First deposit
    newStreak = { current: 1, best: 1 };
  }

  await updateSavingsJar(jarId, {
    currentAmount: newCurrentAmount,
    progress: Math.min(newProgress, 100),
    lastSavedDate: today,
    streak: newStreak,
  });

  console.log(`[Firestore] Added deposit to jar ${jarId}:`, amount);
}

export async function deleteSavingsJar(jarId: string): Promise<void> {
  return deleteDocument(COLLECTIONS.SAVINGS_JARS, jarId);
}

/**
 * Real-time Listeners
 */

export function subscribeToUserTransactions(
  userId: string,
  callback: (transactions: Transaction[]) => void
): Unsubscribe {
  const db = getFirestoreInstance();
  if (!db) throw new Error('Firestore not configured');

  const q = query(
    collection(db, COLLECTIONS.TRANSACTIONS),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];

    callback(transactions);
  });
}

export function subscribeToUserDebts(
  userId: string,
  callback: (debts: Debt[]) => void
): Unsubscribe {
  const db = getFirestoreInstance();
  if (!db) throw new Error('Firestore not configured');

  const q = query(
    collection(db, COLLECTIONS.DEBTS),
    where('userId', '==', userId),
    where('status', '==', 'active')
  );

  return onSnapshot(q, (snapshot) => {
    const debts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Debt[];

    callback(debts);
  });
}

export function subscribeToUserSavingsJars(
  userId: string,
  callback: (jars: SavingsJar[]) => void
): Unsubscribe {
  const db = getFirestoreInstance();
  if (!db) throw new Error('Firestore not configured');

  const q = query(
    collection(db, COLLECTIONS.SAVINGS_JARS),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const jars = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as SavingsJar[];

    callback(jars);
  });
}

/**
 * Batch Operations
 */

export async function batchCreateTransactions(
  transactions: Omit<Transaction, 'id'>[]
): Promise<void> {
  const db = getFirestoreInstance();
  if (!db) throw new Error('Firestore not configured');

  const batch = writeBatch(db);

  transactions.forEach((transaction) => {
    const docRef = doc(collection(db, COLLECTIONS.TRANSACTIONS));
    batch.set(docRef, {
      ...transaction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`[Firestore] Batch created ${transactions.length} transactions`);
}

/**
 * Sync operation - used by sync manager
 */
export async function syncToFirestore(
  collectionName: string,
  operation: 'create' | 'update' | 'delete',
  data: any
): Promise<void> {
  if (!isFirebaseReady()) {
    throw new Error('Firebase not configured - cannot sync to cloud');
  }

  const db = getFirestoreInstance();
  if (!db) throw new Error('Firestore not configured');

  try {
    switch (operation) {
      case 'create':
        // Remove id if it exists (Firestore will generate new one)
        const { id, ...createData } = data;
        await createDocument(collectionName, createData);
        break;

      case 'update':
        if (!data.id) throw new Error('Update requires document ID');
        const { id: updateId, ...updateData } = data;
        await updateDocument(collectionName, updateId, updateData);
        break;

      case 'delete':
        if (!data.id) throw new Error('Delete requires document ID');
        await deleteDocument(collectionName, data.id);
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    console.log(
      `[Firestore] Sync completed: ${operation} in ${collectionName}`
    );
  } catch (error) {
    console.error(`[Firestore] Sync failed:`, error);
    throw error;
  }
}
