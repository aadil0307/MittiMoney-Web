/**
 * IndexedDB Wrapper for MittiMoney
 * Provides typed, promise-based access to IndexedDB for offline-first storage
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Export types for use in other modules
export type User = {
  uid: string;
  phoneNumber: string;
  displayName?: string;
  profileImage?: string;
  preferredLanguage: 'hi' | 'mr' | 'ta' | 'en';
  incomeSource: string;
  cashInHand: number;
  bankBalance: number;
  voiceGuidanceEnabled: boolean;
  notificationsEnabled: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  onboardingCompleted: boolean;
  walletAddress?: string;
};

export type Transaction = {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  voiceTranscript?: string;
  voiceConfidence?: number;
  sentiment?: {
    score: number;
    magnitude: number;
    stressLevel: 'low' | 'medium' | 'high';
  };
  timestamp: Date;
  paymentMethod: 'cash' | 'upi' | 'bank';
  syncStatus: 'pending' | 'synced';
  offlineCreatedAt?: Date;
};

export type Debt = {
  id: string;
  userId: string;
  name: string;
  lenderName?: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number;
  dueDate?: Date;
  urgency: 'low' | 'medium' | 'high';
  monthlyPayment?: number;
  lastPaymentDate?: Date;
  paymentHistory: Array<{
    amount: number;
    date: Date;
    note?: string;
  }>;
  treePosition?: {
    x: number;
    y: number;
    angle: number;
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'paid_off';
  syncStatus: 'pending' | 'synced';
};

export type SavingsJar = {
  id: string;
  userId: string;
  name: string;
  goal: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  icon?: string;
  deadline?: Date;
  progress: number;
  streak?: {
    current: number;
    best: number;
  };
  lastSavedDate?: Date;
  milestones: Array<{
    amount: number;
    date: Date;
    badge?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'pending' | 'synced';
};

// Define database schema
interface MittiMoneyDB extends DBSchema {
  users: {
    key: string;
    value: {
      uid: string;
      phoneNumber: string;
      displayName?: string;
      profileImage?: string;
      preferredLanguage: 'hi' | 'mr' | 'ta' | 'en';
      incomeSource: string;
      cashInHand: number;
      bankBalance: number;
      voiceGuidanceEnabled: boolean;
      notificationsEnabled: boolean;
      createdAt: Date;
      lastLoginAt: Date;
      onboardingCompleted: boolean;
      walletAddress?: string;
    };
  };
  transactions: {
    key: string;
    value: {
      id: string;
      userId: string;
      amount: number;
      type: 'income' | 'expense';
      category: string;
      description: string;
      voiceTranscript?: string;
      voiceConfidence?: number;
      sentiment?: {
        score: number;
        magnitude: number;
        stressLevel: 'low' | 'medium' | 'high';
      };
      timestamp: Date;
      paymentMethod: 'cash' | 'upi' | 'bank';
      syncStatus: 'pending' | 'synced';
      offlineCreatedAt?: Date;
    };
    indexes: { 
      'by-user': string;
      'by-sync-status': string;
      'by-timestamp': Date;
    };
  };
  debts: {
    key: string;
    value: {
      id: string;
      userId: string;
      name: string;
      lenderName?: string;
      totalAmount: number;
      remainingAmount: number;
      interestRate?: number;
      dueDate?: Date;
      urgency: 'low' | 'medium' | 'high';
      monthlyPayment?: number;
      lastPaymentDate?: Date;
      paymentHistory: Array<{
        amount: number;
        date: Date;
        note?: string;
      }>;
      treePosition?: {
        x: number;
        y: number;
        angle: number;
      };
      createdAt: Date;
      updatedAt: Date;
      status: 'active' | 'paid_off';
      syncStatus: 'pending' | 'synced';
    };
    indexes: { 
      'by-user': string;
      'by-status': string;
    };
  };
  savings_jars: {
    key: string;
    value: {
      id: string;
      userId: string;
      name: string;
      goal: string;
      targetAmount: number;
      currentAmount: number;
      color: string;
      icon?: string;
      streak: {
        current: number;
        longest: number;
        lastSavedDate: Date;
      };
      badges: Array<{
        id: string;
        name: string;
        earnedAt: Date;
        icon: string;
      }>;
      deposits: Array<{
        amount: number;
        date: Date;
        note?: string;
      }>;
      createdAt: Date;
      updatedAt: Date;
      completedAt?: Date;
      status: 'active' | 'completed' | 'paused';
      syncStatus: 'pending' | 'synced';
    };
    indexes: { 
      'by-user': string;
      'by-status': string;
    };
  };
  sync_queue: {
    key: number;
    value: {
      id: number;
      collection: 'users' | 'transactions' | 'debts' | 'savings_jars';
      operation: 'create' | 'update' | 'delete';
      data: any;
      timestamp: Date;
      retryCount: number;
    };
    indexes: { 
      'by-timestamp': Date;
    };
  };
}

const DB_NAME = 'mittimoney-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<MittiMoneyDB> | null = null;

/**
 * Initialize and open the database
 */
export async function initDB(): Promise<IDBPDatabase<MittiMoneyDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<MittiMoneyDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log('[IndexedDB] Upgrading database from version', oldVersion, 'to', newVersion);

      // Create users store
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'uid' });
      }

      // Create transactions store with indexes
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('by-user', 'userId');
        txStore.createIndex('by-sync-status', 'syncStatus');
        txStore.createIndex('by-timestamp', 'timestamp');
      }

      // Create debts store with indexes
      if (!db.objectStoreNames.contains('debts')) {
        const debtStore = db.createObjectStore('debts', { keyPath: 'id' });
        debtStore.createIndex('by-user', 'userId');
        debtStore.createIndex('by-status', 'status');
      }

      // Create savings_jars store with indexes
      if (!db.objectStoreNames.contains('savings_jars')) {
        const jarStore = db.createObjectStore('savings_jars', { keyPath: 'id' });
        jarStore.createIndex('by-user', 'userId');
        jarStore.createIndex('by-status', 'status');
      }

      // Create sync_queue store
      if (!db.objectStoreNames.contains('sync_queue')) {
        const queueStore = db.createObjectStore('sync_queue', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        queueStore.createIndex('by-timestamp', 'timestamp');
      }
    },
  });

  console.log('[IndexedDB] Database initialized successfully');
  return dbInstance;
}

/**
 * Get the database instance
 */
export async function getDB(): Promise<IDBPDatabase<MittiMoneyDB>> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

// ==================== USER OPERATIONS ====================

export async function saveUser(user: MittiMoneyDB['users']['value']): Promise<void> {
  const db = await getDB();
  await db.put('users', user);
  console.log('[IndexedDB] User saved:', user.uid);
}

export async function getUser(uid: string): Promise<MittiMoneyDB['users']['value'] | undefined> {
  const db = await getDB();
  return await db.get('users', uid);
}

export async function deleteUser(uid: string): Promise<void> {
  const db = await getDB();
  await db.delete('users', uid);
  console.log('[IndexedDB] User deleted:', uid);
}

// ==================== TRANSACTION OPERATIONS ====================

export async function saveTransaction(transaction: MittiMoneyDB['transactions']['value']): Promise<void> {
  const db = await getDB();
  await db.put('transactions', transaction);
  console.log('[IndexedDB] Transaction saved:', transaction.id);
}

export async function getTransaction(id: string): Promise<MittiMoneyDB['transactions']['value'] | undefined> {
  const db = await getDB();
  return await db.get('transactions', id);
}

export async function getTransactionsByUser(userId: string): Promise<MittiMoneyDB['transactions']['value'][]> {
  const db = await getDB();
  return await db.getAllFromIndex('transactions', 'by-user', userId);
}

export async function getPendingTransactions(): Promise<MittiMoneyDB['transactions']['value'][]> {
  const db = await getDB();
  return await db.getAllFromIndex('transactions', 'by-sync-status', 'pending');
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('transactions', id);
  console.log('[IndexedDB] Transaction deleted:', id);
}

// ==================== DEBT OPERATIONS ====================

export async function saveDebt(debt: MittiMoneyDB['debts']['value']): Promise<void> {
  const db = await getDB();
  await db.put('debts', debt);
  console.log('[IndexedDB] Debt saved:', debt.id);
}

export async function getDebt(id: string): Promise<MittiMoneyDB['debts']['value'] | undefined> {
  const db = await getDB();
  return await db.get('debts', id);
}

export async function getDebtsByUser(userId: string): Promise<MittiMoneyDB['debts']['value'][]> {
  const db = await getDB();
  return await db.getAllFromIndex('debts', 'by-user', userId);
}

export async function getActiveDebts(userId: string): Promise<MittiMoneyDB['debts']['value'][]> {
  const db = await getDB();
  const allDebts = await db.getAllFromIndex('debts', 'by-user', userId);
  return allDebts.filter(debt => debt.status === 'active');
}

export async function deleteDebt(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('debts', id);
  console.log('[IndexedDB] Debt deleted:', id);
}

// ==================== SAVINGS JAR OPERATIONS ====================

export async function saveSavingsJar(jar: MittiMoneyDB['savings_jars']['value']): Promise<void> {
  const db = await getDB();
  await db.put('savings_jars', jar);
  console.log('[IndexedDB] Savings jar saved:', jar.id);
}

export async function getSavingsJar(id: string): Promise<MittiMoneyDB['savings_jars']['value'] | undefined> {
  const db = await getDB();
  return await db.get('savings_jars', id);
}

export async function getSavingsJarsByUser(userId: string): Promise<MittiMoneyDB['savings_jars']['value'][]> {
  const db = await getDB();
  return await db.getAllFromIndex('savings_jars', 'by-user', userId);
}

export async function getActiveSavingsJars(userId: string): Promise<MittiMoneyDB['savings_jars']['value'][]> {
  const db = await getDB();
  const allJars = await db.getAllFromIndex('savings_jars', 'by-user', userId);
  return allJars.filter(jar => jar.status === 'active');
}

export async function deleteSavingsJar(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('savings_jars', id);
  console.log('[IndexedDB] Savings jar deleted:', id);
}

// ==================== SYNC QUEUE OPERATIONS ====================

export async function addToSyncQueue(
  collection: MittiMoneyDB['sync_queue']['value']['collection'],
  operation: MittiMoneyDB['sync_queue']['value']['operation'],
  data: any
): Promise<number> {
  const db = await getDB();
  
  const queueItem: Omit<MittiMoneyDB['sync_queue']['value'], 'id'> = {
    collection,
    operation,
    data,
    timestamp: new Date(),
    retryCount: 0,
  };
  
  const id = await db.add('sync_queue', queueItem as MittiMoneyDB['sync_queue']['value']);
  console.log('[IndexedDB] Added to sync queue:', id);
  return id as number;
}

export async function getSyncQueue(): Promise<MittiMoneyDB['sync_queue']['value'][]> {
  const db = await getDB();
  return await db.getAll('sync_queue');
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('sync_queue', id);
  console.log('[IndexedDB] Removed from sync queue:', id);
}

export async function updateSyncQueueRetryCount(id: number, retryCount: number): Promise<void> {
  const db = await getDB();
  const item = await db.get('sync_queue', id);
  if (item) {
    item.retryCount = retryCount;
    await db.put('sync_queue', item);
  }
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('sync_queue');
  console.log('[IndexedDB] Sync queue cleared');
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Clear all data (use with caution!)
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  
  await db.clear('users');
  await db.clear('transactions');
  await db.clear('debts');
  await db.clear('savings_jars');
  await db.clear('sync_queue');
  
  console.log('[IndexedDB] All data cleared');
}

/**
 * Get database statistics
 */
export async function getDBStats(): Promise<{
  users: number;
  transactions: number;
  debts: number;
  savingsJars: number;
  syncQueueSize: number;
}> {
  const db = await getDB();
  
  const [users, transactions, debts, savingsJars, syncQueue] = await Promise.all([
    db.count('users'),
    db.count('transactions'),
    db.count('debts'),
    db.count('savings_jars'),
    db.count('sync_queue'),
  ]);
  
  return {
    users,
    transactions,
    debts,
    savingsJars,
    syncQueueSize: syncQueue,
  };
}

/**
 * Close the database connection
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('[IndexedDB] Database connection closed');
  }
}
