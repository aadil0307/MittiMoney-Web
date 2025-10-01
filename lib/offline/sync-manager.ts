/**
 * Sync Manager for MittiMoney
 * Handles automatic synchronization between IndexedDB and Firebase Firestore
 */

import {
  getSyncQueue,
  removeSyncQueueItem,
  updateSyncQueueRetryCount,
  addToSyncQueue,
  getPendingTransactions,
  saveTransaction,
  saveDebt,
  saveSavingsJar,
} from './indexeddb';

// Firebase imports
import { syncToFirestore } from '@/lib/firebase/firestore';
import { isFirebaseReady } from '@/lib/firebase/config';

const MAX_RETRY_ATTEMPTS = 3;
const SYNC_INTERVAL = 30000; // 30 seconds
const RETRY_DELAY = 5000; // 5 seconds

interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingItems: number;
  failedItems: number;
  successCount: number;
  errorCount: number;
}

class SyncManager {
  private syncInterval: NodeJS.Timeout | null = null;
  private status: SyncStatus = {
    isSyncing: false,
    lastSyncTime: null,
    pendingItems: 0,
    failedItems: 0,
    successCount: 0,
    errorCount: 0,
  };
  private listeners: Array<(status: SyncStatus) => void> = [];

  /**
   * Start automatic sync
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      console.log('[SyncManager] Auto-sync already running');
      return;
    }

    console.log('[SyncManager] Starting auto-sync');
    
    // Initial sync
    this.syncNow();
    
    // Set up interval
    this.syncInterval = setInterval(() => {
      this.syncNow();
    }, SYNC_INTERVAL);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[SyncManager] Auto-sync stopped');
    }
  }

  /**
   * Perform sync now
   */
  async syncNow(): Promise<void> {
    if (this.status.isSyncing) {
      console.log('[SyncManager] Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('[SyncManager] Device offline, skipping sync');
      return;
    }

    this.status.isSyncing = true;
    this.notifyListeners();

    try {
      console.log('[SyncManager] Starting sync...');
      
      const queue = await getSyncQueue();
      this.status.pendingItems = queue.length;
      
      if (queue.length === 0) {
        console.log('[SyncManager] No items to sync');
        this.status.lastSyncTime = new Date();
        return;
      }

      // Process queue items
      for (const item of queue) {
        try {
          await this.processSyncItem(item);
          await removeSyncQueueItem(item.id);
          this.status.successCount++;
          console.log(`[SyncManager] Synced item ${item.id}`);
        } catch (error) {
          console.error(`[SyncManager] Failed to sync item ${item.id}:`, error);
          
          // Retry logic
          if (item.retryCount < MAX_RETRY_ATTEMPTS) {
            await updateSyncQueueRetryCount(item.id, item.retryCount + 1);
            console.log(`[SyncManager] Will retry item ${item.id} (attempt ${item.retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
          } else {
            console.error(`[SyncManager] Max retries exceeded for item ${item.id}`);
            this.status.failedItems++;
            this.status.errorCount++;
            // Optionally: remove from queue or flag as failed
            await removeSyncQueueItem(item.id);
          }
        }
      }

      this.status.lastSyncTime = new Date();
      console.log('[SyncManager] Sync completed successfully');
      
    } catch (error) {
      console.error('[SyncManager] Sync failed:', error);
      this.status.errorCount++;
    } finally {
      this.status.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Process a single sync item
   */
  private async processSyncItem(item: any): Promise<void> {
    console.log(`[SyncManager] Processing ${item.operation} on ${item.collection}:`, item.data);
    
    // Check if Firebase is configured
    if (!isFirebaseReady()) {
      console.warn('[SyncManager] Firebase not configured, skipping cloud sync');
      // Still update local sync status
      await this.updateLocalSyncStatus(item);
      return;
    }
    
    try {
      // Sync to Firebase Firestore
      await syncToFirestore(item.collection, item.operation, item.data);
      console.log(`[SyncManager] Successfully synced to Firestore: ${item.collection}/${item.operation}`);
      
      // Update sync status in local IndexedDB
      await this.updateLocalSyncStatus(item);
      
    } catch (error) {
      console.error(`[SyncManager] Firestore sync failed:`, error);
      throw error; // Let the retry logic handle it
    }
  }

  /**
   * Update local IndexedDB record with synced status
   */
  private async updateLocalSyncStatus(item: any): Promise<void> {
    if (!item.data || !item.data.id) return;
    
    const updatedData = { ...item.data, syncStatus: 'synced' };
    
    switch (item.collection) {
      case 'transactions':
        await saveTransaction(updatedData);
        break;
      case 'debts':
        await saveDebt(updatedData);
        break;
      case 'savings_jars':
        await saveSavingsJar(updatedData);
        break;
      default:
        console.warn(`[SyncManager] Unknown collection: ${item.collection}`);
    }
  }

  /**
   * Add a listener for sync status changes
   */
  addListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener({ ...this.status });
    });
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Reset sync statistics
   */
  resetStats(): void {
    this.status.successCount = 0;
    this.status.errorCount = 0;
    this.status.failedItems = 0;
    this.notifyListeners();
  }
}

// Export singleton instance
export const syncManager = new SyncManager();

/**
 * Helper function to queue an operation for sync
 */
export async function queueForSync(
  collection: 'users' | 'transactions' | 'debts' | 'savings_jars',
  operation: 'create' | 'update' | 'delete',
  data: any
): Promise<void> {
  await addToSyncQueue(collection, operation, data);
  console.log(`[SyncManager] Queued ${operation} on ${collection}`);
  
  // Trigger sync if online
  if (navigator.onLine) {
    syncManager.syncNow();
  }
}

/**
 * Initialize sync manager on app start
 */
export function initializeSyncManager(): void {
  console.log('[SyncManager] Initializing...');
  
  // Start auto-sync
  syncManager.startAutoSync();
  
  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('[SyncManager] Device online, triggering sync');
    syncManager.syncNow();
  });
  
  window.addEventListener('offline', () => {
    console.log('[SyncManager] Device offline');
  });
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    syncManager.stopAutoSync();
  });
}

/**
 * Manual sync trigger for UI buttons
 */
export async function triggerManualSync(): Promise<void> {
  if (!navigator.onLine) {
    throw new Error('Cannot sync while offline');
  }
  
  await syncManager.syncNow();
}

/**
 * Get pending sync count
 */
export async function getPendingSyncCount(): Promise<number> {
  const queue = await getSyncQueue();
  return queue.length;
}
