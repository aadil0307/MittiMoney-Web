"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wifi, WifiOff, Upload, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { initDB, getDBStats } from "@/lib/offline/indexeddb"
import { initializeSyncManager, syncManager, getPendingSyncCount } from "@/lib/offline/sync-manager"

interface OfflineContextType {
  isOnline: boolean
  pendingSync: number
  syncData: () => Promise<void>
  isReady: boolean
}

const OfflineContext = createContext<OfflineContextType | null>(null)

export function useOffline() {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error("useOffline must be used within OfflineProvider")
  }
  return context
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initializeOfflineSupport = async () => {
      try {
        // Initialize IndexedDB
        await initDB()
        console.log('[OfflineProvider] IndexedDB initialized')
        
        // Initialize sync manager
        initializeSyncManager()
        console.log('[OfflineProvider] Sync manager initialized')
        
        // Get initial pending count
        const count = await getPendingSyncCount()
        setPendingSync(count)
        
        setIsReady(true)
      } catch (error) {
        console.error('[OfflineProvider] Failed to initialize:', error)
      }
    }

    initializeOfflineSupport()

    const handleOnline = () => {
      setIsOnline(true)
      console.log('[OfflineProvider] Device online')
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      console.log('[OfflineProvider] Device offline')
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial status
    setIsOnline(navigator.onLine)

    // Subscribe to sync manager status
    const unsubscribe = syncManager.addListener((status) => {
      setSyncing(status.isSyncing)
      setPendingSync(status.pendingItems)
    })

    // Periodic update of pending count
    const interval = setInterval(async () => {
      const count = await getPendingSyncCount()
      setPendingSync(count)
    }, 10000) // Every 10 seconds

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      unsubscribe()
      clearInterval(interval)
      syncManager.stopAutoSync()
    }
  }, [])

  const syncData = async () => {
    if (!isOnline || syncing) {
      console.log('[OfflineProvider] Cannot sync:', { isOnline, syncing })
      return
    }

    try {
      await syncManager.syncNow()
      const count = await getPendingSyncCount()
      setPendingSync(count)
    } catch (error) {
      console.error("[OfflineProvider] Sync failed:", error)
    }
  }

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingSync,
        syncData,
        isReady,
      }}
    >
      {children}
      {isReady && <OfflineIndicator syncing={syncing} />}
    </OfflineContext.Provider>
  )
}

function OfflineIndicator({ syncing }: { syncing: boolean }) {
  const { isOnline, pendingSync, syncData } = useOffline()

  return (
    <AnimatePresence>
      {(!isOnline || pendingSync > 0) && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50"
        >
          <div className="bg-white/95 backdrop-blur-sm border border-amber-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOnline ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-red-500" />}
                <div>
                  <p className="font-medium text-gray-900">{isOnline ? "ऑनलाइन" : "ऑफलाइन मोड"}</p>
                  {pendingSync > 0 && <p className="text-sm text-gray-600">{pendingSync} आइटम सिंक के लिए बाकी</p>}
                </div>
              </div>

              {isOnline && pendingSync > 0 && (
                <Button
                  onClick={syncData}
                  disabled={syncing}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {syncing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Upload className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-1" />
                      सिंक करें
                    </>
                  )}
                </Button>
              )}
            </div>

            {!isOnline && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    आप ऑफलाइन हैं। आपके डेटा को स्थानीय रूप से सहेजा जा रहा है और इंटरनेट कनेक्शन वापस आने पर सिंक हो जाएगा।
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
