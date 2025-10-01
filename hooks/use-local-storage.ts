"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

export function useOfflineStorage() {
  const [transactions, setTransactions] = useLocalStorage("mittimoney_transactions", [])
  const [savings, setSavings] = useLocalStorage("mittimoney_savings", [])
  const [debts, setDebts] = useLocalStorage("mittimoney_debts", [])
  const [chitFunds, setChitFunds] = useLocalStorage("mittimoney_chit_funds", [])

  return {
    transactions,
    setTransactions,
    savings,
    setSavings,
    debts,
    setDebts,
    chitFunds,
    setChitFunds,
  }
}
