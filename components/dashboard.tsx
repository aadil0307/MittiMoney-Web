"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Mic,
  Wallet,
  TreePine,
  Target,
  Users,
  User,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  BarChart3,
  Bell,
  CreditCard,
  Brain,
} from "lucide-react"
import { RadialMenu } from "@/components/radial-menu"
import { VoiceTransactionLogger } from "@/components/voice-transaction-logger"
import { TransactionHistory } from "@/components/transaction-history"
import { SavingsJars } from "@/components/savings-jars"
import { DebtTree } from "@/components/debt-tree"
import { MittiCommit } from "@/components/mitti-commit"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { BillReminders } from "@/components/bill-reminders"
import { NotificationCenter } from "@/components/notification-center"
import { AIExpenseCategorizer } from "@/components/ai-expense-categorizer"
import { FinancialGoals } from "@/components/financial-goals"
import { UPIPaymentGateway } from "@/components/upi-payment-gateway"
import { useLanguage } from "@/contexts/language-context"
import { useTransactions } from "@/hooks/useIndexedDB"
import { useAuth } from "@/contexts/auth-context"

interface Transaction {
  id: string
  amount: number
  category: string
  description: string
  type: "income" | "expense"
  timestamp: Date
  confidence: number
}

export function Dashboard() {
  // Get authenticated user ID from auth context
  const { user, signOut: handleSignOut, userProfile } = useAuth()
  const userId = user?.uid || "demo-user-123"
  
  const { 
    transactions: dbTransactions, 
    loading: transactionsLoading,
    addTransaction 
  } = useTransactions(userId)
  
  // Initialize with user profile data from onboarding
  const [cashInHand, setCashInHand] = useState(0)
  const [bankBalance, setBankBalance] = useState(0)
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)
  const [totalSavings, setTotalSavings] = useState(0)
  const [isProfileLoaded, setIsProfileLoaded] = useState(false)
  
  // Load user profile data from Firestore
  useEffect(() => {
    if (userProfile && !isProfileLoaded) {
      console.log("[Dashboard] Loading user profile data:", userProfile)
      setCashInHand(userProfile.cashInHand || 0)
      setBankBalance(userProfile.bankBalance || 0)
      setTotalSavings((userProfile.cashInHand || 0) + (userProfile.bankBalance || 0))
      setIsProfileLoaded(true)
      console.log("[Dashboard] Profile loaded - Cash:", userProfile.cashInHand, "Bank:", userProfile.bankBalance)
    }
  }, [userProfile, isProfileLoaded])
  
  // Calculate financial summaries from actual transactions
  useEffect(() => {
    if (dbTransactions.length === 0 || !isProfileLoaded) return
    
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    let income = 0
    let expenses = 0
    // Start with the user's initial cash balance from onboarding
    let cash = userProfile?.cashInHand || 0
    
    dbTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.timestamp)
      const isCurrentMonth = 
        transactionDate.getMonth() === currentMonth && 
        transactionDate.getFullYear() === currentYear
      
      if (transaction.type === "income") {
        cash += transaction.amount
        if (isCurrentMonth) income += transaction.amount
      } else {
        cash -= transaction.amount
        if (isCurrentMonth) expenses += transaction.amount
      }
    })
    
    setCashInHand(cash)
    setMonthlyIncome(income)
    setMonthlyExpenses(expenses)
  }, [dbTransactions, isProfileLoaded, userProfile])
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "voice"
    | "savings"
    | "debts"
    | "chit"
    | "analytics"
    | "bills"
    | "ai-categorizer"
    | "goals"
    | "payments"
  >("dashboard")
  const { language } = useLanguage()
  const [showNotifications, setShowNotifications] = useState(false)

  const totalBalance = cashInHand + bankBalance

  const handleTransactionAdded = async (transaction: Transaction) => {
    // Save to IndexedDB (will auto-sync to Firebase when online)
    await addTransaction({
      ...transaction,
      userId,
      synced: false
    })
    
    // Balances will be updated automatically via useEffect
  }

  if (currentView === "voice") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button onClick={() => setCurrentView("dashboard")} variant="outline" className="mb-4">
              ← Back to Dashboard
            </Button>
          </div>

          <VoiceTransactionLogger onTransactionAdded={handleTransactionAdded} selectedLanguage={language} />

          {dbTransactions.length > 0 && (
            <TransactionHistory transactions={dbTransactions} selectedLanguage={language} />
          )}
        </div>
      </div>
    )
  }

  if (currentView === "savings") {
    return <SavingsJars selectedLanguage={language} onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "debts") {
    return <DebtTree selectedLanguage={language} onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "chit") {
    return <MittiCommit selectedLanguage={language} onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "analytics") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between p-6">
            <Button onClick={() => setCurrentView("dashboard")} variant="outline">
              ← Back to Dashboard
            </Button>
          </div>
          <AnalyticsDashboard language={language} />
        </div>
      </div>
    )
  }

  if (currentView === "bills") {
    return <BillReminders language={language} onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "ai-categorizer") {
    return <AIExpenseCategorizer language={language} onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "goals") {
    return <FinancialGoals language={language} onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "payments") {
    return <UPIPaymentGateway language={language} onBack={() => setCurrentView("dashboard")} />
  }

  // Show loading state while profile or transactions are being loaded
  if (!isProfileLoaded || transactionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="relative">
            <div className="w-24 h-24 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-orange-600 bg-clip-text text-transparent">
              {!isProfileLoaded ? 'Loading your profile...' : 'Loading your financial data...'}
            </h3>
            <p className="text-muted-foreground text-sm">Please wait while we fetch your information</p>
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Enhanced Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 dark:border-slate-700/50"
        >
          <div className="space-y-2 mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary via-accent to-orange-600 bg-clip-text text-transparent leading-tight">
                  नमस्ते! {userProfile?.displayName || 'Welcome Back'}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base font-medium">Let's manage your money wisely today</p>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-2 ml-14 md:ml-15">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-muted-foreground font-mono">+91 {user.phoneNumber?.slice(-10)}</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {/* Notification Bell */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowNotifications(true)}
                className="relative rounded-full w-14 h-14 shadow-lg border-2"
              >
                <Bell className="w-6 h-6" />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg"
                >
                  3
                </motion.span>
              </Button>
            </motion.div>
            
            {/* Logout Button */}
            {user && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="h-14"
                >
                  Logout
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Balance Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Cash in Hand */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }} 
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 backdrop-blur-sm hover:shadow-amber-500/50 transition-all duration-300 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="text-base font-semibold tracking-wide">Cash in Hand</span>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <IndianRupee className="w-8 h-8 text-white/90" />
                  <span className="text-4xl font-extrabold text-white tracking-tight">{cashInHand.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-white/70 text-sm mt-2 font-medium">Available now</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bank/UPI Balance */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }} 
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 backdrop-blur-sm hover:shadow-blue-500/50 transition-all duration-300 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="text-base font-semibold tracking-wide">Bank/UPI</span>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <IndianRupee className="w-8 h-8 text-white/90" />
                  <span className="text-4xl font-extrabold text-white tracking-tight">{bankBalance.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-white/70 text-sm mt-2 font-medium">In your accounts</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Balance */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }} 
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-600 to-green-700 dark:from-emerald-700 dark:to-green-800 backdrop-blur-sm hover:shadow-emerald-500/50 transition-all duration-300 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="text-base font-semibold tracking-wide">Total Balance</span>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <IndianRupee className="w-8 h-8 text-white/90" />
                  <span className="text-4xl font-extrabold text-white tracking-tight">{totalBalance.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-white/70 text-sm mt-2 font-medium">Total net worth</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Monthly Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.3 }}>
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 border border-green-200 dark:border-green-900/30 group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground font-semibold">Monthly Income</span>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <IndianRupee className="w-7 h-7 text-green-600" />
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{monthlyIncome.toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-green-100 dark:bg-green-950 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-xs text-green-600 font-semibold">+65%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.3 }}>
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 border border-red-200 dark:border-red-900/30 group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground font-semibold">Monthly Expenses</span>
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-5 h-5 text-white" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <IndianRupee className="w-7 h-7 text-red-600" />
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{monthlyExpenses.toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-red-100 dark:bg-red-950 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-xs text-red-600 font-semibold">45%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.3 }}>
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 border border-blue-200 dark:border-blue-900/30 group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground font-semibold">Total Savings</span>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <IndianRupee className="w-7 h-7 text-blue-600" />
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{totalSavings.toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-blue-100 dark:bg-blue-950 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-xs text-blue-600 font-semibold">80%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary via-accent to-orange-600 bg-clip-text text-transparent">Quick Actions</h2>
            <div className="h-1 flex-1 max-w-xs bg-gradient-to-r from-primary/20 via-accent/20 to-transparent rounded-full ml-6"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
            <motion.div whileHover={{ y: -8, scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 cursor-pointer group" onClick={() => setCurrentView("voice")}>
                <CardContent className="p-5 text-center space-y-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Voice Log</h3>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -8, scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer group" onClick={() => setCurrentView("debts")}>
                <CardContent className="p-5 text-center space-y-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                    <TreePine className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Debt Tree</h3>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -8, scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group" onClick={() => setCurrentView("savings")}>
                <CardContent className="p-5 text-center space-y-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Savings Jars</h3>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -8, scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer group" onClick={() => setCurrentView("chit")}>
                <CardContent className="p-5 text-center space-y-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">MittiCommit</h3>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -8, scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer group" onClick={() => setCurrentView("analytics")}>
                <CardContent className="p-5 text-center space-y-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Analytics</h3>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -8, scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 cursor-pointer group" onClick={() => setCurrentView("bills")}>
                <CardContent className="p-5 text-center space-y-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                    <Bell className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Bills</h3>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -8, scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer group" onClick={() => setCurrentView("ai-categorizer")}>
                <CardContent className="p-5 text-center space-y-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-rose-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">AI Categories</h3>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -8, scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 cursor-pointer group" onClick={() => setCurrentView("goals")}>
                <CardContent className="p-5 text-center space-y-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Goals</h3>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* UPI/Payments Quick Access */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <motion.div whileHover={{ scale: 1.01, y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card
              className="border-0 shadow-2xl bg-gradient-to-br from-primary via-accent to-orange-600 dark:from-primary/90 dark:via-accent/90 dark:to-orange-700 hover:shadow-primary/50 transition-all duration-300 cursor-pointer overflow-hidden relative group"
              onClick={() => setCurrentView("payments")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-pulse" />
              <CardContent className="p-6 md:p-8 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">UPI Payments & Gateway</h3>
                    <p className="text-base md:text-lg text-white/80 font-medium">Send money, pay bills, and manage transactions instantly</p>
                  </div>
                  <motion.div whileHover={{ x: 5, scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-2xl font-bold px-6 py-6 text-base">
                      Open →
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Transactions */}
        {dbTransactions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <TransactionHistory transactions={dbTransactions.slice(0, 5)} selectedLanguage={language} />
          </motion.div>
        )}
      </div>

      {/* Radial Menu */}
      <RadialMenu
        onVoiceLogClick={() => setCurrentView("voice")}
        onSavingsClick={() => setCurrentView("savings")}
        onDebtsClick={() => setCurrentView("debts")}
        onChitClick={() => setCurrentView("chit")}
        onBillsClick={() => setCurrentView("bills")}
      />

      {/* Notification Center */}
      <NotificationCenter
        language={language}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  )
}
