"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IndianRupee, TrendingUp, TrendingDown, Clock } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  category: string
  description: string
  type: "income" | "expense"
  timestamp: Date
  confidence: number
}

interface TransactionHistoryProps {
  transactions: Transaction[]
  selectedLanguage: string
}

const languageTexts = {
  hi: {
    title: "हाल के लेन-देन",
    noTransactions: "कोई लेन-देन नहीं",
    income: "आय",
    expense: "खर्च",
    today: "आज",
    yesterday: "कल",
  },
  en: {
    title: "Recent Transactions",
    noTransactions: "No transactions yet",
    income: "Income",
    expense: "Expense",
    today: "Today",
    yesterday: "Yesterday",
  },
  mr: {
    title: "अलीकडील व्यवहार",
    noTransactions: "अजून कोणतेही व्यवहार नाहीत",
    income: "उत्पन्न",
    expense: "खर्च",
    today: "आज",
    yesterday: "काल",
  },
  ta: {
    title: "சமீபத்திய பரிவர்த்தனைகள்",
    noTransactions: "இன்னும் பரிவர்த்தனைகள் இல்லை",
    income: "வருமானம்",
    expense: "செலவு",
    today: "இன்று",
    yesterday: "நேற்று",
  },
}

export function TransactionHistory({ transactions, selectedLanguage }: TransactionHistoryProps) {
  const texts = languageTexts[selectedLanguage as keyof typeof languageTexts] || languageTexts.en

  const getCategoryColor = (category: string) => {
    const colors = {
      food: "bg-orange-100 text-orange-800",
      transport: "bg-blue-100 text-blue-800",
      shopping: "bg-purple-100 text-purple-800",
      medical: "bg-red-100 text-red-800",
      utilities: "bg-yellow-100 text-yellow-800",
      rent: "bg-green-100 text-green-800",
      salary: "bg-emerald-100 text-emerald-800",
      income: "bg-emerald-100 text-emerald-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return texts.today
    } else if (date.toDateString() === yesterday.toDateString()) {
      return texts.yesterday
    } else {
      return date.toLocaleDateString("en-IN")
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-card to-muted/10 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 pb-4">
        <CardTitle className="flex items-center space-x-3 text-2xl">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{texts.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 opacity-50" />
            </div>
            <p className="text-lg font-medium">{texts.noTransactions}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div
                  className={`flex items-center justify-between p-5 rounded-2xl shadow-lg border-l-4 transition-all duration-300 ${
                    transaction.type === "income"
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 hover:shadow-green-200"
                      : "bg-gradient-to-r from-red-50 to-rose-50 border-red-500 hover:shadow-red-200"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                        transaction.type === "income"
                          ? "bg-gradient-to-br from-green-500 to-emerald-500"
                          : "bg-gradient-to-br from-red-500 to-rose-500"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="w-7 h-7 text-white" />
                      ) : (
                        <TrendingDown className="w-7 h-7 text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={`${getCategoryColor(transaction.category)} text-xs font-semibold px-3 py-1`}>
                          {transaction.category}
                        </Badge>
                        <Badge
                          className={`text-xs font-semibold px-3 py-1 ${
                            transaction.type === "income"
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? texts.income : texts.expense}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground line-clamp-1 mb-1">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {formatDate(transaction.timestamp)} • {formatTime(transaction.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`flex items-center space-x-1 text-2xl font-bold ${
                        transaction.type === "income" ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {transaction.type === "expense" && <span>-</span>}
                      <IndianRupee className="w-5 h-5" />
                      <span>{transaction.amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
