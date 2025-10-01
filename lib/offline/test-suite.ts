/**
 * Offline-First Test Suite
 * Run these tests in browser console to verify IndexedDB integration
 */

import { 
  initDB, 
  saveTransaction, 
  getTransactionsByUser,
  addToSyncQueue,
  getSyncQueue,
  getDBStats 
} from '@/lib/offline/indexeddb';

// Test 1: Initialize Database
export async function testInitDB() {
  console.log('🧪 Test 1: Initialize Database');
  try {
    await initDB();
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

// Test 2: Save Transaction
export async function testSaveTransaction() {
  console.log('🧪 Test 2: Save Transaction');
  try {
    const transaction = {
      id: `test-${Date.now()}`,
      userId: 'test-user',
      amount: 500,
      category: 'food',
      description: 'Test grocery purchase',
      type: 'expense' as const,
      timestamp: new Date(),
      voiceConfidence: 0.95,
      paymentMethod: 'cash' as const,
      syncStatus: 'pending' as const
    };
    
    await saveTransaction(transaction);
    console.log('✅ Transaction saved:', transaction.id);
    return transaction;
  } catch (error) {
    console.error('❌ Save transaction failed:', error);
    return null;
  }
}

// Test 3: Retrieve Transactions
export async function testGetTransactions(userId = 'test-user') {
  console.log('🧪 Test 3: Retrieve Transactions');
  try {
    const transactions = await getTransactionsByUser(userId);
    console.log(`✅ Found ${transactions.length} transactions`);
    console.table(transactions);
    return transactions;
  } catch (error) {
    console.error('❌ Get transactions failed:', error);
    return [];
  }
}

// Test 4: Sync Queue
export async function testSyncQueue() {
  console.log('🧪 Test 4: Sync Queue');
  try {
    // Add to queue
    await addToSyncQueue('transactions', 'create', {
      id: 'queue-test',
      amount: 100,
      category: 'test'
    });
    console.log('✅ Added to sync queue');
    
    // Get queue
    const queue = await getSyncQueue();
    console.log(`✅ Queue has ${queue.length} items`);
    console.table(queue);
    return queue;
  } catch (error) {
    console.error('❌ Sync queue test failed:', error);
    return [];
  }
}

// Test 5: Database Stats
export async function testDBStats() {
  console.log('🧪 Test 5: Database Statistics');
  try {
    const stats = await getDBStats();
    console.log('✅ Database stats:');
    console.table(stats);
    return stats;
  } catch (error) {
    console.error('❌ Stats retrieval failed:', error);
    return null;
  }
}

// Run all tests
export async function runAllTests() {
  console.log('🚀 Running Offline-First Test Suite...\n');
  
  const results = {
    initDB: await testInitDB(),
    saveTransaction: await testSaveTransaction(),
    getTransactions: await testGetTransactions('test-user'),
    syncQueue: await testSyncQueue(),
    dbStats: await testDBStats()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('✅ Init DB:', results.initDB ? 'PASS' : 'FAIL');
  console.log('✅ Save Transaction:', results.saveTransaction ? 'PASS' : 'FAIL');
  console.log('✅ Get Transactions:', results.getTransactions.length > 0 ? 'PASS' : 'FAIL');
  console.log('✅ Sync Queue:', results.syncQueue.length > 0 ? 'PASS' : 'FAIL');
  console.log('✅ DB Stats:', results.dbStats ? 'PASS' : 'FAIL');
  
  return results;
}

// Browser console helpers
if (typeof window !== 'undefined') {
  (window as any).offlineTests = {
    runAll: runAllTests,
    testInitDB,
    testSaveTransaction,
    testGetTransactions,
    testSyncQueue,
    testDBStats
  };
  
  console.log('📦 Offline tests loaded! Run in console:');
  console.log('  offlineTests.runAll() - Run all tests');
  console.log('  offlineTests.testInitDB() - Test database initialization');
  console.log('  offlineTests.testSaveTransaction() - Test saving data');
  console.log('  offlineTests.testGetTransactions() - Test retrieving data');
  console.log('  offlineTests.testSyncQueue() - Test sync queue');
  console.log('  offlineTests.testDBStats() - View database stats');
}

/**
 * Manual Test Scenarios
 * 
 * Scenario 1: Online → Offline → Online
 * 1. Open DevTools Network tab
 * 2. Add transaction while online
 * 3. Set Network to "Offline"
 * 4. Add 2-3 more transactions
 * 5. Verify pending sync count increases
 * 6. Set Network to "Online"
 * 7. Verify auto-sync triggers
 * 8. Check sync queue is empty
 * 
 * Scenario 2: Persistence
 * 1. Add several transactions
 * 2. Hard refresh (Ctrl+Shift+R)
 * 3. Verify data persists
 * 4. Check console for "Loaded X transactions from IndexedDB"
 * 
 * Scenario 3: Sync Retry
 * 1. Set Network to "Slow 3G"
 * 2. Add transaction
 * 3. Watch console for retry attempts
 * 4. Verify exponential backoff
 * 5. Set to "Online"
 * 6. Verify eventual success
 * 
 * Scenario 4: Manual Sync
 * 1. Go offline, add data
 * 2. Go online
 * 3. Click manual sync button
 * 4. Verify immediate sync trigger
 * 5. Watch pending count drop to 0
 */
