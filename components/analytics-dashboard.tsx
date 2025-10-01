"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LucidePieChart,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Banknote,
} from "lucide-react"
import {
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
} from "recharts"

interface AnalyticsDashboardProps {
  language: string
}

const translations = {
  hindi: {
    title: "वित्तीय विश्लेषण",
    monthlyOverview: "मासिक अवलोकन",
    income: "आय",
    expenses: "व्यय",
    savings: "बचत",
    spendingTrends: "खर्च के रुझान",
    categoryBreakdown: "श्रेणी विभाजन",
    financialHealth: "वित्तीय स्वास्थ्य",
    insights: "अंतर्दृष्टि",
    recommendations: "सुझाव",
    thisMonth: "इस महीने",
    lastMonth: "पिछले महीने",
    change: "परिवर्तन",
    excellent: "उत्कृष्ट",
    good: "अच्छा",
    needsImprovement: "सुधार की आवश्यकता",
    viewDetails: "विवरण देखें",
  },
  english: {
    title: "Financial Analytics",
    monthlyOverview: "Monthly Overview",
    income: "Income",
    expenses: "Expenses",
    savings: "Savings",
    spendingTrends: "Spending Trends",
    categoryBreakdown: "Category Breakdown",
    financialHealth: "Financial Health",
    insights: "Insights",
    recommendations: "Recommendations",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    change: "Change",
    excellent: "Excellent",
    good: "Good",
    needsImprovement: "Needs Improvement",
    viewDetails: "View Details",
  },
}

export function AnalyticsDashboard({ language }: AnalyticsDashboardProps) {
  const t = translations[language as keyof typeof translations] || translations.english
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  // Mock data - in real app, this would come from API
  const monthlyData = [
    { month: "Jan", income: 25000, expenses: 18000, savings: 7000 },
    { month: "Feb", income: 27000, expenses: 19500, savings: 7500 },
    { month: "Mar", income: 26000, expenses: 20000, savings: 6000 },
    { month: "Apr", income: 28000, expenses: 21000, savings: 7000 },
    { month: "May", income: 30000, expenses: 22000, savings: 8000 },
    { month: "Jun", income: 32000, expenses: 23500, savings: 8500 },
  ]

  const categoryData = [
    { name: "Food", value: 8500, color: "#D26A4C" },
    { name: "Transport", value: 4200, color: "#A8CBB7" },
    { name: "Utilities", value: 3800, color: "#FFC107" },
    { name: "Healthcare", value: 2500, color: "#EA580C" },
    { name: "Entertainment", value: 2000, color: "#6B5B4F" },
    { name: "Others", value: 2500, color: "#E5DDD5" },
  ]

  const currentMonth = monthlyData[monthlyData.length - 1]
  const previousMonth = monthlyData[monthlyData.length - 2]

  const incomeChange = ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100
  const expenseChange = ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
  const savingsChange = ((currentMonth.savings - previousMonth.savings) / previousMonth.savings) * 100

  const financialHealthScore = useMemo(() => {
    const savingsRate = (currentMonth.savings / currentMonth.income) * 100
    const expenseRatio = (currentMonth.expenses / currentMonth.income) * 100

    if (savingsRate >= 20 && expenseRatio <= 70) return { score: 85, status: "excellent" }
    if (savingsRate >= 10 && expenseRatio <= 80) return { score: 70, status: "good" }
    return { score: 45, status: "needsImprovement" }
  }, [currentMonth])

  const insights = [
    {
      type: "positive",
      icon: LucidePieChart,
      message: language === "hindi" ? "आपकी बचत इस महीने 13% बढ़ी है!" : "Your savings increased by 13% this month!",
      action: language === "hindi" ? "और बचत करें" : "Save More",
    },
    {
      type: "warning",
      icon: AlertTriangle,
      message: language === "hindi" ? "खाने पर खर्च बजट से 15% अधिक है" : "Food expenses are 15% over budget",
      action: language === "hindi" ? "बजट समायोजित करें" : "Adjust Budget",
    },
    {
      type: "info",
      icon: Target,
      message: language === "hindi" ? "आप अपने मासिक लक्ष्य के 85% पर हैं" : "You're at 85% of your monthly goal",
      action: language === "hindi" ? "लक्ष्य देखें" : "View Goals",
    },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">{t.title}</h2>
        <div className="flex gap-2">
          {["week", "month", "year"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Monthly Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-2 border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.income}</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{currentMonth.income.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {incomeChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={incomeChange >= 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(incomeChange).toFixed(1)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-2 border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.expenses}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{currentMonth.expenses.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {expenseChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-red-600 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-green-600 mr-1" />
                )}
                <span className={expenseChange >= 0 ? "text-red-600" : "text-green-600"}>
                  {Math.abs(expenseChange).toFixed(1)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-2 border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.savings}</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{currentMonth.savings.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {savingsChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={savingsChange >= 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(savingsChange).toFixed(1)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trends */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t.spendingTrends}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="var(--chart-2)"
                    fill="var(--chart-2)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucidePieChart className="h-5 w-5 text-primary" />
                {t.categoryBreakdown}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-sm text-muted-foreground">{category.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Financial Health & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Health Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                {t.financialHealth}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{financialHealthScore.score}</div>
                <Badge
                  variant={
                    financialHealthScore.status === "excellent"
                      ? "default"
                      : financialHealthScore.status === "good"
                        ? "secondary"
                        : "destructive"
                  }
                  className="text-sm"
                >
                  {t[financialHealthScore.status as keyof typeof t]}
                </Badge>
              </div>
              <Progress value={financialHealthScore.score} className="h-3" />
              <div className="text-sm text-muted-foreground text-center">
                {language === "hindi"
                  ? "आपका वित्तीय स्वास्थ्य स्कोर आपकी बचत दर और खर्च के अनुपात पर आधारित है"
                  : "Your financial health score is based on your savings rate and expense ratio"}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights & Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t.insights}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <insight.icon
                    className={`h-5 w-5 mt-0.5 ${
                      insight.type === "positive"
                        ? "text-green-600"
                        : insight.type === "warning"
                          ? "text-orange-600"
                          : "text-blue-600"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-2">{insight.message}</p>
                    <Button size="sm" variant="outline" className="text-xs bg-transparent">
                      {insight.action}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
