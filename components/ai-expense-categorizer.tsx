"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Zap,
  CheckCircle,
  Edit,
  TrendingUp,
  PieChart,
  Target,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Gamepad2,
  Heart,
  GraduationCap,
  Shirt,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Transaction {
  id: string
  description: string
  amount: number
  suggestedCategory: string
  confidence: number
  isConfirmed: boolean
  timestamp: Date
  finalCategory?: string
}

interface CategorySuggestion {
  category: string
  confidence: number
  reason: string
}

interface AIExpenseCategorizerProps {
  language: string
  onBack: () => void
}

const translations = {
  hindi: {
    title: "AI खर्च वर्गीकरण",
    subtitle: "स्मार्ट AI आपके खर्चों को स्वचालित रूप से वर्गीकृत करता है",
    pendingReview: "समीक्षा के लिए लंबित",
    confirmed: "पुष्ट",
    confidence: "विश्वास",
    accept: "स्वीकार करें",
    reject: "अस्वीकार करें",
    edit: "संपादित करें",
    customCategory: "कस्टम श्रेणी",
    aiSuggestion: "AI सुझाव",
    reason: "कारण",
    accuracy: "सटीकता",
    totalTransactions: "कुल लेनदेन",
    autoApproved: "स्वतः अनुमोदित",
    needsReview: "समीक्षा आवश्यक",
    categories: {
      food: "भोजन",
      transport: "परिवहन",
      shopping: "खरीदारी",
      entertainment: "मनोरंजन",
      healthcare: "स्वास्थ्य सेवा",
      education: "शिक्षा",
      utilities: "उपयोगिताएं",
      clothing: "कपड़े",
      other: "अन्य",
    },
  },
  english: {
    title: "AI Expense Categorization",
    subtitle: "Smart AI automatically categorizes your expenses",
    pendingReview: "Pending Review",
    confirmed: "Confirmed",
    confidence: "Confidence",
    accept: "Accept",
    reject: "Reject",
    edit: "Edit",
    customCategory: "Custom Category",
    aiSuggestion: "AI Suggestion",
    reason: "Reason",
    accuracy: "Accuracy",
    totalTransactions: "Total Transactions",
    autoApproved: "Auto Approved",
    needsReview: "Needs Review",
    categories: {
      food: "Food",
      transport: "Transport",
      shopping: "Shopping",
      entertainment: "Entertainment",
      healthcare: "Healthcare",
      education: "Education",
      utilities: "Utilities",
      clothing: "Clothing",
      other: "Other",
    },
  },
}

const categoryIcons = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingCart,
  entertainment: Gamepad2,
  healthcare: Heart,
  education: GraduationCap,
  utilities: Home,
  clothing: Shirt,
  other: Target,
}

export function AIExpenseCategorizer({ language, onBack }: AIExpenseCategorizerProps) {
  const t = translations[language as keyof typeof translations] || translations.english
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [customCategory, setCustomCategory] = useState("")
  const [aiAccuracy, setAiAccuracy] = useState(87)

  // Mock AI categorization function
  const categorizeExpense = (description: string, amount: number): CategorySuggestion => {
    const desc = description.toLowerCase()

    // Simple rule-based categorization (in real app, this would be ML-powered)
    if (desc.includes("food") || desc.includes("restaurant") || desc.includes("cafe") || desc.includes("grocery")) {
      return {
        category: "food",
        confidence: 92,
        reason: "Contains food-related keywords and matches spending pattern",
      }
    }
    if (desc.includes("uber") || desc.includes("taxi") || desc.includes("bus") || desc.includes("metro")) {
      return {
        category: "transport",
        confidence: 95,
        reason: "Transportation service detected",
      }
    }
    if (desc.includes("amazon") || desc.includes("flipkart") || desc.includes("shopping") || desc.includes("mall")) {
      return {
        category: "shopping",
        confidence: 88,
        reason: "E-commerce or retail transaction identified",
      }
    }
    if (desc.includes("movie") || desc.includes("netflix") || desc.includes("game") || desc.includes("entertainment")) {
      return {
        category: "entertainment",
        confidence: 90,
        reason: "Entertainment-related expense detected",
      }
    }
    if (
      desc.includes("hospital") ||
      desc.includes("doctor") ||
      desc.includes("medicine") ||
      desc.includes("pharmacy")
    ) {
      return {
        category: "healthcare",
        confidence: 94,
        reason: "Healthcare service or medical expense",
      }
    }
    if (desc.includes("electricity") || desc.includes("water") || desc.includes("gas") || desc.includes("internet")) {
      return {
        category: "utilities",
        confidence: 96,
        reason: "Utility bill payment detected",
      }
    }

    // Default categorization based on amount
    if (amount > 5000) {
      return {
        category: "shopping",
        confidence: 65,
        reason: "High amount suggests major purchase",
      }
    }

    return {
      category: "other",
      confidence: 45,
      reason: "Unable to determine specific category",
    }
  }

  // Mock data initialization
  useEffect(() => {
    const mockTransactions = [
      {
        id: "1",
        description: "Swiggy Food Delivery",
        amount: 450,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isConfirmed: false,
      },
      {
        id: "2",
        description: "Uber Ride to Office",
        amount: 180,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isConfirmed: false,
      },
      {
        id: "3",
        description: "Amazon Purchase",
        amount: 2500,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
        isConfirmed: true,
        finalCategory: "shopping",
      },
      {
        id: "4",
        description: "Electricity Bill Payment",
        amount: 1200,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        isConfirmed: false,
      },
      {
        id: "5",
        description: "Movie Ticket BookMyShow",
        amount: 300,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        isConfirmed: true,
        finalCategory: "entertainment",
      },
    ]

    const processedTransactions = mockTransactions.map((transaction) => {
      const suggestion = categorizeExpense(transaction.description, transaction.amount)
      return {
        ...transaction,
        suggestedCategory: suggestion.category,
        confidence: suggestion.confidence,
      }
    })

    setTransactions(processedTransactions)
  }, [])

  const pendingTransactions = transactions.filter((t) => !t.isConfirmed)
  const confirmedTransactions = transactions.filter((t) => t.isConfirmed)
  const autoApprovedCount = confirmedTransactions.filter((t) => t.confidence >= 90).length
  const needsReviewCount = pendingTransactions.length

  const handleAcceptSuggestion = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, isConfirmed: true, finalCategory: t.suggestedCategory } : t)),
    )
  }

  const handleRejectSuggestion = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId)
    if (transaction) {
      setEditingTransaction(transaction)
    }
  }

  const handleCustomCategorization = () => {
    if (editingTransaction && customCategory) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTransaction.id ? { ...t, isConfirmed: true, finalCategory: customCategory } : t,
        ),
      )
      setEditingTransaction(null)
      setCustomCategory("")
    }
  }

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const CategoryIcon = categoryIcons[transaction.suggestedCategory as keyof typeof categoryIcons] || Target
    const suggestion = categorizeExpense(transaction.description, transaction.amount)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full"
      >
        <Card
          className={`border-2 transition-all duration-300 hover:shadow-lg ${
            transaction.isConfirmed
              ? "border-secondary/50 bg-secondary/5"
              : transaction.confidence >= 90
                ? "border-primary/50 bg-primary/5"
                : "border-accent/50 bg-accent/5"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.isConfirmed
                      ? "bg-secondary/20"
                      : transaction.confidence >= 90
                        ? "bg-primary/20"
                        : "bg-accent/20"
                  }`}
                >
                  <CategoryIcon
                    className={`w-5 h-5 ${
                      transaction.isConfirmed
                        ? "text-secondary-foreground"
                        : transaction.confidence >= 90
                          ? "text-primary"
                          : "text-accent-foreground"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{transaction.description}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>₹{transaction.amount.toLocaleString()}</span>
                    <span>•</span>
                    <span>{transaction.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Badge variant={transaction.isConfirmed ? "secondary" : "outline"} className="mb-1">
                    {transaction.isConfirmed
                      ? t.categories[transaction.finalCategory as keyof typeof t.categories]
                      : t.categories[transaction.suggestedCategory as keyof typeof t.categories]}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Brain className="w-3 h-3" />
                    <span>
                      {transaction.confidence}% {t.confidence}
                    </span>
                  </div>
                </div>

                {!transaction.isConfirmed && (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleAcceptSuggestion(transaction.id)} className="h-8 px-2">
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectSuggestion(transaction.id)}
                      className="h-8 px-2"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {transaction.isConfirmed && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {t.confirmed}
                  </Badge>
                )}
              </div>
            </div>

            {!transaction.isConfirmed && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3 mt-0.5 text-accent" />
                  <div>
                    <span className="font-medium">{t.aiSuggestion}:</span>
                    <p className="mt-1">{suggestion.reason}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline">
              ← Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Brain className="w-8 h-8" />
                {t.title}
              </h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* AI Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.accuracy}</p>
                  <p className="text-xl font-bold text-primary">{aiAccuracy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.totalTransactions}</p>
                  <p className="text-xl font-bold text-secondary-foreground">{transactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.autoApproved}</p>
                  <p className="text-xl font-bold text-accent-foreground">{autoApprovedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.needsReview}</p>
                  <p className="text-xl font-bold text-destructive">{needsReviewCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Accuracy Progress */}
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              AI Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Accuracy</span>
                <span>{aiAccuracy}%</span>
              </div>
              <Progress value={aiAccuracy} className="h-2" />
              <p className="text-xs text-muted-foreground">
                AI improves with each confirmed transaction. Target: 95% accuracy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Review Section */}
        {pendingTransactions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent-foreground">
                  <TrendingUp className="w-5 h-5" />
                  {t.pendingReview} ({pendingTransactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence>
                  {pendingTransactions.map((transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Confirmed Transactions */}
        {confirmedTransactions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-2 border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                  <CheckCircle className="w-5 h-5" />
                  {t.confirmed} ({confirmedTransactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence>
                  {confirmedTransactions.map((transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Custom Category Dialog */}
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t.customCategory}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Transaction: {editingTransaction?.description}</p>
                <Select value={customCategory} onValueChange={setCustomCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.categories).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCustomCategorization} className="flex-1">
                  Confirm
                </Button>
                <Button variant="outline" onClick={() => setEditingTransaction(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
