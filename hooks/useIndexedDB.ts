/**
 * Custom hook for IndexedDB operations
 * Provides reactive access to offline storage with automatic sync
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  initDB,
  saveTransaction,
  getTransactionsByUser,
  saveDebt,
  getDebtsByUser,
  saveSavingsJar,
  getSavingsJarsByUser,
  getDBStats,
} from '@/lib/offline/indexeddb';
import { queueForSync, syncManager, getPendingSyncCount } from '@/lib/offline/sync-manager';

interface UseIndexedDBResult {
  isReady: boolean;
  error: Error | null;
  stats: {
    users: number;
    transactions: number;
    debts: number;
    savingsJars: number;
    syncQueueSize: number;
  } | null;
}

/**
 * Initialize IndexedDB
 */
export function useIndexedDB(): UseIndexedDBResult {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<UseIndexedDBResult['stats']>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initDB();
        const dbStats = await getDBStats();
        setStats(dbStats);
        setIsReady(true);
        console.log('[useIndexedDB] Database ready');
      } catch (err) {
        console.error('[useIndexedDB] Failed to initialize:', err);
        setError(err as Error);
      }
    };

    init();
  }, []);

  return { isReady, error, stats };
}

/**
 * Hook for transaction operations
 */
export function useTransactions(userId: string) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTransactionsByUser(userId);
      // Sort by timestamp descending
      const sorted = data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setTransactions(sorted);
      setError(null);
    } catch (err) {
      console.error('[useTransactions] Failed to load:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadTransactions();
    }
  }, [userId, loadTransactions]);

  const addTransaction = useCallback(async (transaction: any) => {
    try {
      const transactionWithUser = {
        ...transaction,
        userId,
        syncStatus: 'pending' as const,
        offlineCreatedAt: new Date(),
      };
      
      await saveTransaction(transactionWithUser);
      await queueForSync('transactions', 'create', transactionWithUser);
      await loadTransactions(); // Refresh list
      
      console.log('[useTransactions] Transaction added:', transaction.id);
    } catch (err) {
      console.error('[useTransactions] Failed to add:', err);
      throw err;
    }
  }, [userId, loadTransactions]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<any>) => {
    try {
      const existing = transactions.find(t => t.id === id);
      if (!existing) {
        throw new Error('Transaction not found');
      }
      
      const updated = {
        ...existing,
        ...updates,
        syncStatus: 'pending' as const,
      };
      
      await saveTransaction(updated);
      await queueForSync('transactions', 'update', updated);
      await loadTransactions(); // Refresh list
      
      console.log('[useTransactions] Transaction updated:', id);
    } catch (err) {
      console.error('[useTransactions] Failed to update:', err);
      throw err;
    }
  }, [transactions, loadTransactions]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    refresh: loadTransactions,
  };
}

/**
 * Hook for debt operations
 */
export function useDebts(userId: string) {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDebts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDebtsByUser(userId);
      // Sort by urgency and amount
      const sorted = data.sort((a, b) => {
        const urgencyOrder = { high: 0, medium: 1, low: 2 };
        const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        if (urgencyDiff !== 0) return urgencyDiff;
        return b.remainingAmount - a.remainingAmount;
      });
      setDebts(sorted);
      setError(null);
    } catch (err) {
      console.error('[useDebts] Failed to load:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadDebts();
    }
  }, [userId, loadDebts]);

  const addDebt = useCallback(async (debt: any) => {
    try {
      const debtWithUser = {
        ...debt,
        userId,
        syncStatus: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await saveDebt(debtWithUser);
      await queueForSync('debts', 'create', debtWithUser);
      await loadDebts(); // Refresh list
      
      console.log('[useDebts] Debt added:', debt.id);
    } catch (err) {
      console.error('[useDebts] Failed to add:', err);
      throw err;
    }
  }, [userId, loadDebts]);

  const updateDebt = useCallback(async (id: string, updates: Partial<any>) => {
    try {
      const existing = debts.find(d => d.id === id);
      if (!existing) {
        throw new Error('Debt not found');
      }
      
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date(),
        syncStatus: 'pending' as const,
      };
      
      await saveDebt(updated);
      await queueForSync('debts', 'update', updated);
      await loadDebts(); // Refresh list
      
      console.log('[useDebts] Debt updated:', id);
    } catch (err) {
      console.error('[useDebts] Failed to update:', err);
      throw err;
    }
  }, [debts, loadDebts]);

  const addRepayment = useCallback(async (debtId: string, amount: number, note?: string) => {
    try {
      const debt = debts.find(d => d.id === debtId);
      if (!debt) {
        throw new Error('Debt not found');
      }
      
      const newRemainingAmount = Math.max(0, debt.remainingAmount - amount);
      const newPaymentHistory = [
        ...debt.paymentHistory,
        {
          amount,
          date: new Date(),
          note,
        },
      ];
      
      await updateDebt(debtId, {
        remainingAmount: newRemainingAmount,
        paymentHistory: newPaymentHistory,
        lastPaymentDate: new Date(),
        status: newRemainingAmount === 0 ? 'paid_off' : 'active',
      });
      
      console.log('[useDebts] Repayment added:', { debtId, amount });
    } catch (err) {
      console.error('[useDebts] Failed to add repayment:', err);
      throw err;
    }
  }, [debts, updateDebt]);

  return {
    debts,
    loading,
    error,
    addDebt,
    updateDebt,
    addRepayment,
    refresh: loadDebts,
  };
}

/**
 * Hook for savings jar operations
 */
export function useSavingsJars(userId: string) {
  const [jars, setJars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadJars = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSavingsJarsByUser(userId);
      // Sort by status and progress
      const sorted = data.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'active' ? -1 : 1;
        }
        const aProgress = (a.currentAmount / a.targetAmount) * 100;
        const bProgress = (b.currentAmount / b.targetAmount) * 100;
        return bProgress - aProgress;
      });
      setJars(sorted);
      setError(null);
    } catch (err) {
      console.error('[useSavingsJars] Failed to load:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadJars();
    }
  }, [userId, loadJars]);

  const addJar = useCallback(async (jar: any) => {
    try {
      const jarWithUser = {
        ...jar,
        userId,
        syncStatus: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await saveSavingsJar(jarWithUser);
      await queueForSync('savings_jars', 'create', jarWithUser);
      await loadJars(); // Refresh list
      
      console.log('[useSavingsJars] Jar added:', jar.id);
    } catch (err) {
      console.error('[useSavingsJars] Failed to add:', err);
      throw err;
    }
  }, [userId, loadJars]);

  const addDeposit = useCallback(async (jarId: string, amount: number, note?: string) => {
    try {
      const jar = jars.find(j => j.id === jarId);
      if (!jar) {
        throw new Error('Jar not found');
      }
      
      const newCurrentAmount = Math.min(jar.targetAmount, jar.currentAmount + amount);
      const newDeposits = [
        ...jar.deposits,
        {
          amount,
          date: new Date(),
          note,
        },
      ];
      
      // Update streak
      const today = new Date();
      const lastSaved = new Date(jar.streak.lastSavedDate);
      const daysDiff = Math.floor((today.getTime() - lastSaved.getTime()) / (1000 * 60 * 60 * 24));
      
      let newStreak = jar.streak;
      if (daysDiff === 1) {
        // Consecutive day
        newStreak = {
          current: jar.streak.current + 1,
          longest: Math.max(jar.streak.longest, jar.streak.current + 1),
          lastSavedDate: today,
        };
      } else if (daysDiff === 0) {
        // Same day
        newStreak = {
          ...jar.streak,
          lastSavedDate: today,
        };
      } else {
        // Streak broken
        newStreak = {
          current: 1,
          longest: jar.streak.longest,
          lastSavedDate: today,
        };
      }
      
      const updated = {
        ...jar,
        currentAmount: newCurrentAmount,
        deposits: newDeposits,
        streak: newStreak,
        status: newCurrentAmount >= jar.targetAmount ? 'completed' : 'active',
        completedAt: newCurrentAmount >= jar.targetAmount ? today : jar.completedAt,
        updatedAt: today,
        syncStatus: 'pending' as const,
      };
      
      await saveSavingsJar(updated);
      await queueForSync('savings_jars', 'update', updated);
      await loadJars(); // Refresh list
      
      console.log('[useSavingsJars] Deposit added:', { jarId, amount });
    } catch (err) {
      console.error('[useSavingsJars] Failed to add deposit:', err);
      throw err;
    }
  }, [jars, loadJars]);

  return {
    jars,
    loading,
    error,
    addJar,
    addDeposit,
    refresh: loadJars,
  };
}

/**
 * Hook for sync status
 */
export function useSyncStatus() {
  const [status, setStatus] = useState(syncManager.getStatus());
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = syncManager.addListener((newStatus) => {
      setStatus(newStatus);
    });

    // Update pending count
    const updatePendingCount = async () => {
      const count = await getPendingSyncCount();
      setPendingCount(count);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const triggerSync = useCallback(async () => {
    await syncManager.syncNow();
  }, []);

  return {
    ...status,
    pendingCount,
    triggerSync,
  };
}
