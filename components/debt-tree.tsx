"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TreePine,
  Plus,
  IndianRupee,
  Calendar,
  AlertTriangle,
  CheckCircle,
  User,
  Building,
  CreditCard,
  Home,
  Car,
  GraduationCap,
  Heart,
  Edit,
  Trash2,
  DollarSign,
  TrendingDown,
  Target,
  Clock,
  Percent,
  ArrowLeft,
  Sparkles,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { 
  createDebt, 
  getDebtsByUser, 
  updateDebt, 
  deleteDebt,
  addDebtRepayment 
} from "@/lib/firebase/firestore"
import type { Debt } from "@/lib/offline/indexeddb"

interface DebtTreeProps {
  selectedLanguage: string
  onBack: () => void
}

const debtIcons = {
  personal: User,
  bank: Building,
  credit: CreditCard,
  home: Home,
  vehicle: Car,
  education: GraduationCap,
  medical: Heart,
  other: DollarSign,
}

const languageTexts = {
  hi: {
    title: "कर्ज़ का पेड़",
    subtitle: "अपने कर्ज़ों को देखें और प्रबंधित करें",
    addDebt: "नया कर्ज़ जोड़ें",
    debtName: "कर्ज़ का नाम",
    creditor: "देनदार",
    totalAmount: "कुल राशि",
    monthlyPayment: "मासिक भुगतान",
    dueDate: "देय तिथि",
    priority: "प्राथमिकता",
    category: "श्रेणी",
    interestRate: "ब्याज दर",
    makePayment: "भुगतान करें",
    paymentAmount: "भुगतान राशि",
    pay: "भुगतान करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    create: "बनाएं",
    cancel: "रद्द करें",
    remaining: "बकाया",
    paid: "भुगतान किया गया",
    progress: "प्रगति",
    high: "उच्च",
    medium: "मध्यम",
    low: "कम",
    overdue: "देर से",
    dueSoon: "जल्दी देय",
    onTrack: "सही रास्ते पर",
    congratulations: "बधाई हो!",
    debtCleared: "कर्ज़ चुकता हो गया!",
    noDebts: "कोई कर्ज़ नहीं",
    debtFree: "आप कर्ज़ मुक्त हैं!",
  },
  en: {
    title: "Debt Tree",
    subtitle: "Visualize and manage your debts",
    addDebt: "Add New Debt",
    debtName: "Debt Name",
    creditor: "Creditor",
    totalAmount: "Total Amount",
    monthlyPayment: "Monthly Payment",
    dueDate: "Due Date",
    priority: "Priority",
    category: "Category",
    interestRate: "Interest Rate",
    makePayment: "Make Payment",
    paymentAmount: "Payment Amount",
    pay: "Pay",
    edit: "Edit",
    delete: "Delete",
    create: "Create",
    cancel: "Cancel",
    remaining: "Remaining",
    paid: "Paid",
    progress: "Progress",
    high: "High",
    medium: "Medium",
    low: "Low",
    overdue: "Overdue",
    dueSoon: "Due Soon",
    onTrack: "On Track",
    congratulations: "Congratulations!",
    debtCleared: "Debt Cleared!",
    noDebts: "No Debts",
    debtFree: "You are debt-free!",
  },
  mr: {
    title: "कर्जाचे झाड",
    subtitle: "तुमची कर्जे पहा आणि व्यवस्थापित करा",
    addDebt: "नवीन कर्ज जोडा",
    debtName: "कर्जाचे नाव",
    creditor: "कर्जदार",
    totalAmount: "एकूण रक्कम",
    monthlyPayment: "मासिक पेमेंट",
    dueDate: "देय तारीख",
    priority: "प्राधान्य",
    category: "प्रकार",
    interestRate: "व्याज दर",
    makePayment: "पेमेंट करा",
    paymentAmount: "पेमेंट रक्कम",
    pay: "पेमेंट करा",
    edit: "संपादित करा",
    delete: "काढून टाका",
    create: "तयार करा",
    cancel: "रद्द करा",
    remaining: "उरलेली",
    paid: "भरलेली",
    progress: "प्रगती",
    high: "उच्च",
    medium: "मध्यम",
    low: "कमी",
    overdue: "उशीरा",
    dueSoon: "लवकर देय",
    onTrack: "योग्य मार्गावर",
    congratulations: "अभिनंदन!",
    debtCleared: "कर्ज फेडले!",
    noDebts: "कोणतेही कर्ज नाही",
    debtFree: "तुम्ही कर्जमुक्त आहात!",
  },
  ta: {
    title: "கடன் மரம்",
    subtitle: "உங்கள் கடன்களைப் பார்த்து நிர்வகிக்கவும்",
    addDebt: "புதிய கடன் சேர்க்கவும்",
    debtName: "கடனின் பெயர்",
    creditor: "கடனாளி",
    totalAmount: "மொத்த தொகை",
    monthlyPayment: "மாதாந்திர பணம்",
    dueDate: "செலுத்த வேண்டிய தேதி",
    priority: "முன்னுரிமை",
    category: "வகை",
    interestRate: "வட்டி விகிதம்",
    makePayment: "பணம் செலுத்தவும்",
    paymentAmount: "பணம் தொகை",
    pay: "செலுத்தவும்",
    edit: "திருத்தவும்",
    delete: "நீக்கவும்",
    create: "உருவாக்கவும்",
    cancel: "ரத்து செய்",
    remaining: "மீதமுள்ள",
    paid: "செலுத்தப்பட்ட",
    progress: "முன்னேற்றம்",
    high: "உயர்",
    medium: "நடுத்தர",
    low: "குறைவு",
    overdue: "தாமதம்",
    dueSoon: "விரைவில் செலுத்த வேண்டும்",
    onTrack: "சரியான பாதையில்",
    congratulations: "வாழ்த்துக்கள்!",
    debtCleared: "கடன் அடைக்கப்பட்டது!",
    noDebts: "கடன் இல்லை",
    debtFree: "நீங்கள் கடன் இல்லாதவர்!",
  },
}

export function DebtTree({ selectedLanguage, onBack }: DebtTreeProps) {
  const { user } = useAuth()
  const userId = user?.uid || ""

  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)

  // Load debts from Firestore
  useEffect(() => {
    const loadDebts = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        console.log("[DebtTree] Loading debts for user:", userId)
        const userDebts = await getDebtsByUser(userId)
        console.log("[DebtTree] Loaded debts:", userDebts)
        setDebts(userDebts)
      } catch (error) {
        console.error("[DebtTree] Error loading debts:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDebts()
  }, [userId])

  const [showAddForm, setShowAddForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [celebratingDebt, setCelebratingDebt] = useState<string | null>(null)
  const [newDebt, setNewDebt] = useState<{
    name: string
    lenderName: string
    totalAmount: string
    monthlyPayment: string
    dueDate: string
    urgency: "high" | "medium" | "low"
    interestRate: string
  }>({
    name: "",
    lenderName: "",
    totalAmount: "",
    monthlyPayment: "",
    dueDate: "",
    urgency: "medium",
    interestRate: "",
  })

  const texts = languageTexts[selectedLanguage as keyof typeof languageTexts] || languageTexts.en

  const makePayment = async (debtId: string) => {
    if (!paymentAmount) return

    const amount = Number.parseFloat(paymentAmount)
    
    try {
      // Find the debt before payment
      const debt = debts.find((d) => d.id === debtId)
      const willBePaidOff = debt && (debt.remainingAmount - amount) <= 0

      // Update in Firestore
      await addDebtRepayment(debtId, amount)
      console.log("[DebtTree] Payment recorded:", { debtId, amount })

      // Show celebration if debt is paid off
      if (willBePaidOff && debt && debt.remainingAmount > 0) {
        setCelebratingDebt(debtId)
        setTimeout(() => setCelebratingDebt(null), 3000)
      }

      // Reload debts from Firestore
      if (userId) {
        const userDebts = await getDebtsByUser(userId)
        setDebts(userDebts)
      }
    } catch (error) {
      console.error("[DebtTree] Error making payment:", error)
      alert("Failed to record payment. Please try again.")
    }

    setPaymentAmount("")
    setShowPaymentForm(null)
  }

  const addDebt = async () => {
    if (!userId) {
      alert("Please sign in to add debts")
      return
    }

    if (newDebt.name && newDebt.lenderName && newDebt.totalAmount && newDebt.monthlyPayment) {
      try {
        const debtData: Omit<Debt, 'id'> = {
          userId,
          name: newDebt.name,
          lenderName: newDebt.lenderName,
          totalAmount: Number.parseFloat(newDebt.totalAmount),
          remainingAmount: Number.parseFloat(newDebt.totalAmount),
          monthlyPayment: newDebt.monthlyPayment ? Number.parseFloat(newDebt.monthlyPayment) : undefined,
          dueDate: newDebt.dueDate ? new Date(newDebt.dueDate) : undefined,
          urgency: newDebt.urgency,
          interestRate: newDebt.interestRate ? Number.parseFloat(newDebt.interestRate) : undefined,
          status: "active" as const,
          paymentHistory: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'synced',
        }

        const debtId = await createDebt(debtData)
        console.log("[DebtTree] Debt created:", debtId)

        // Reload debts from Firestore
        const userDebts = await getDebtsByUser(userId)
        setDebts(userDebts)

        // Reset form
        setNewDebt({
          name: "",
          lenderName: "",
          totalAmount: "",
          monthlyPayment: "",
          dueDate: "",
          urgency: "medium",
          interestRate: "",
        })
        setShowAddForm(false)
      } catch (error) {
        console.error("[DebtTree] Error creating debt:", error)
        alert("Failed to create debt. Please try again.")
      }
    }
  }

  const getDebtStatus = (debt: Debt) => {
    if (!debt.dueDate) return "onTrack"
    
    const today = new Date()
    const dueDate = new Date(debt.dueDate)
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) return "overdue"
    if (daysUntilDue <= 7) return "dueSoon"
    return "onTrack"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "bg-red-100 text-red-800"
      case "dueSoon":
        return "bg-yellow-100 text-yellow-800"
      case "onTrack":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBranchColor = (debt: Debt) => {
    const progress = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100
    const status = getDebtStatus(debt)

    if (progress >= 100) return "from-green-400 to-green-600"
    if (status === "overdue") return "from-red-400 to-red-600"
    if (status === "dueSoon") return "from-yellow-400 to-yellow-600"
    if (progress >= 50) return "from-orange-400 to-orange-600"
    return "from-gray-400 to-gray-600"
  }

  const getBranchThickness = (debt: Debt) => {
    const progress = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100
    if (progress >= 100) return "h-2"
    if (progress >= 75) return "h-3"
    if (progress >= 50) return "h-4"
    if (progress >= 25) return "h-5"
    return "h-6"
  }

  const getProgressPercentage = (debt: Debt) => {
    return ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0)
  const totalPaid = debts.reduce((sum, debt) => sum + (debt.totalAmount - debt.remainingAmount), 0)
  const activeDebts = debts.filter((debt) => debt.remainingAmount > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button onClick={onBack} variant="outline" className="backdrop-blur-sm bg-white/90 hover:bg-white shadow-lg border-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div className="text-center">
            <motion.h1 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 bg-clip-text text-transparent mb-2"
            >
              {texts.title}
            </motion.h1>
            <p className="text-gray-600 font-medium">{texts.subtitle}</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => setShowAddForm(true)} 
              className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-500/50 border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              {texts.addDebt}
            </Button>
          </motion.div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
          >
            <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl shadow-rose-500/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-red-500/5" />
              <CardHeader className="pb-3 relative">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-gray-700 font-bold">Total Debt</span>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/50">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-baseline space-x-1">
                  <IndianRupee className="w-6 h-6 text-rose-600" />
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
                    {totalDebt.toLocaleString("en-IN")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
          >
            <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl shadow-emerald-500/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5" />
              <CardHeader className="pb-3 relative">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-gray-700 font-bold">Total Paid</span>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-baseline space-x-1">
                  <IndianRupee className="w-6 h-6 text-emerald-600" />
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {totalPaid.toLocaleString("en-IN")}
                  </span>
                </div>
                <Progress 
                  value={totalPaid > 0 ? (totalPaid / (totalDebt + totalPaid)) * 100 : 0} 
                  className="mt-3 h-2"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
          >
            <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl shadow-blue-500/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/5" />
              <CardHeader className="pb-3 relative">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-gray-700 font-bold">Active Debts</span>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {activeDebts.length}
                  </span>
                  <span className="text-gray-600 font-medium">active</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {loading ? (
          <Card className="border-2 border-border/50">
            <CardContent className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your debts...</p>
            </CardContent>
          </Card>
        ) : debts.length === 0 ? (
          <Card className="border-2 border-border/50">
            <CardContent className="text-center py-16">
              <TreePine className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-2xl font-bold text-green-600 mb-2">{texts.noDebts}</h3>
              <p className="text-muted-foreground">{texts.debtFree}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-8 h-32 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-lg relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <TreePine className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {debts.map((debt, index) => {
                const IconComponent = DollarSign // Default icon
                const progress = getProgressPercentage(debt)
                const status = getDebtStatus(debt)
                const isCleared = debt.remainingAmount === 0

                return (
                  <motion.div
                    key={debt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card className="overflow-hidden border-2 border-border/50 hover:shadow-lg transition-all duration-300">
                      <div className="relative h-4 overflow-hidden">
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${getBranchColor(debt)} ${getBranchThickness(debt)}`}
                          animate={{
                            opacity: isCleared ? [1, 0.7, 1] : 1,
                            scale: isCleared ? [1, 1.05, 1] : 1,
                          }}
                          transition={{
                            duration: 2,
                            repeat: isCleared ? Number.POSITIVE_INFINITY : 0,
                          }}
                        />
                        {progress > 0 && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600"
                            style={{ width: `${progress}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        )}
                      </div>

                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 rounded-full bg-gradient-to-br ${getBranchColor(debt)} flex items-center justify-center text-white shadow-lg`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{debt.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{debt.lenderName || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <Badge className={getStatusColor(status)}>
                              {status === "overdue"
                                ? texts.overdue
                                : status === "dueSoon"
                                  ? texts.dueSoon
                                  : texts.onTrack}
                            </Badge>
                            <Badge className={getUrgencyColor(debt.urgency)}>
                              {debt.urgency === "high"
                                ? texts.high
                                : debt.urgency === "medium"
                                  ? texts.medium
                                  : texts.low}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{texts.progress}</span>
                            <span className="font-semibold">{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress} className="h-3" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-muted-foreground">{texts.remaining}:</span>
                              <IndianRupee className="w-4 h-4 text-red-600" />
                              <span className="text-lg font-bold text-red-600">
                                {debt.remainingAmount.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-muted-foreground">{texts.paid}:</span>
                              <IndianRupee className="w-4 h-4 text-green-600" />
                              <span className="text-lg font-bold text-green-600">
                                {(debt.totalAmount - debt.remainingAmount).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {debt.monthlyPayment && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Monthly Payment:</span>
                            <div className="flex items-center space-x-1">
                              <IndianRupee className="w-4 h-4" />
                              <span className="font-semibold">{debt.monthlyPayment.toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        )}

                        {debt.dueDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Next Due:</span>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span className="font-semibold">{new Date(debt.dueDate).toLocaleDateString("en-IN")}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2 pt-2">
                          <Button onClick={() => setShowPaymentForm(debt.id)} className="flex-1" disabled={isCleared}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            {texts.makePayment}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <AnimatePresence>
                      {celebratingDebt === debt.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 bg-gradient-to-br from-green-400/90 to-emerald-500/90 rounded-lg flex items-center justify-center text-white text-center p-6"
                        >
                          <div className="space-y-3">
                            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: 2 }}>
                              <CheckCircle className="w-16 h-16 mx-auto" />
                            </motion.div>
                            <div>
                              <h3 className="text-xl font-bold">{texts.congratulations}</h3>
                              <p className="text-sm">{texts.debtCleared}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-lg p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-xl font-bold text-center">{texts.addDebt}</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{texts.debtName}</label>
                    <Input
                      value={newDebt.name}
                      onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                      placeholder="Personal Loan, Credit Card, etc."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{texts.creditor}</label>
                    <Input
                      value={newDebt.lenderName}
                      onChange={(e) => setNewDebt({ ...newDebt, lenderName: e.target.value })}
                      placeholder="Bank name, Person name, etc."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{texts.totalAmount}</label>
                    <Input
                      type="number"
                      value={newDebt.totalAmount}
                      onChange={(e) => setNewDebt({ ...newDebt, totalAmount: e.target.value })}
                      placeholder="100000"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{texts.monthlyPayment}</label>
                    <Input
                      type="number"
                      value={newDebt.monthlyPayment}
                      onChange={(e) => setNewDebt({ ...newDebt, monthlyPayment: e.target.value })}
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{texts.dueDate}</label>
                    <Input
                      type="date"
                      value={newDebt.dueDate}
                      onChange={(e) => setNewDebt({ ...newDebt, dueDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{texts.priority}</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {(["high", "medium", "low"] as const).map((urgency) => (
                        <Button
                          key={urgency}
                          variant={newDebt.urgency === urgency ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewDebt({ ...newDebt, urgency })}
                        >
                          {urgency === "high" ? texts.high : urgency === "medium" ? texts.medium : texts.low}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">{texts.interestRate} (%)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newDebt.interestRate}
                      onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })}
                      placeholder="12.5"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={addDebt} className="flex-1">
                    {texts.create}
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                    {texts.cancel}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPaymentForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-lg p-6 w-full max-w-sm space-y-4"
              >
                <h3 className="text-xl font-bold text-center">{texts.makePayment}</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{texts.paymentAmount}</label>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="5000"
                      className="text-center text-lg"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={() => makePayment(showPaymentForm)} className="flex-1">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {texts.pay}
                  </Button>
                  <Button onClick={() => setShowPaymentForm(null)} variant="outline" className="flex-1">
                    {texts.cancel}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
