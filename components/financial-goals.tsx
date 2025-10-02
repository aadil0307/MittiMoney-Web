"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Target,
  Plus,
  IndianRupee,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Car,
  Home,
  Plane,
  GraduationCap,
  Heart,
  Briefcase,
  Gift,
  Zap,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import {
  createGoal as createGoalInFirestore,
  getGoalsByUser,
  updateGoal as updateGoalInFirestore,
  addGoalProgress,
  deleteGoal as deleteGoalFromFirestore,
  type FinancialGoal as FirestoreGoal,
} from "@/lib/firebase/firestore"

type FinancialGoal = FirestoreGoal

interface Milestone {
  id: string
  title: string
  targetAmount: number
  isCompleted: boolean
  completedDate?: Date
}

interface FinancialGoalsProps {
  language: string
  onBack: () => void
}

const translations = {
  hindi: {
    title: "वित्तीय लक्ष्य",
    subtitle: "अपने सपनों को वास्तविकता में बदलें",
    addGoal: "नया लक्ष्य जोड़ें",
    activeGoals: "सक्रिय लक्ष्य",
    completedGoals: "पूर्ण लक्ष्य",
    goalTitle: "लक्ष्य शीर्षक",
    description: "विवरण",
    targetAmount: "लक्ष्य राशि",
    targetDate: "लक्ष्य तिथि",
    category: "श्रेणी",
    priority: "प्राथमिकता",
    monthlyContribution: "मासिक योगदान",
    autoContribute: "स्वचालित योगदान",
    progress: "प्रगति",
    timeLeft: "समय बचा",
    onTrack: "सही रास्ते पर",
    behindSchedule: "समय से पीछे",
    completed: "पूर्ण",
    addMilestone: "मील का पत्थर जोड़ें",
    milestones: "मील के पत्थर",
    contribute: "योगदान करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    save: "सहेजें",
    cancel: "रद्द करें",
    high: "उच्च",
    medium: "मध्यम",
    low: "कम",
    days: "दिन",
    months: "महीने",
    years: "साल",
    categories: {
      emergency: "आपातकाल",
      vacation: "छुट्टी",
      car: "कार",
      house: "घर",
      education: "शिक्षा",
      wedding: "शादी",
      business: "व्यापार",
      retirement: "सेवानिवृत्ति",
      other: "अन्य",
    },
  },
  english: {
    title: "Financial Goals",
    subtitle: "Turn your dreams into reality",
    addGoal: "Add New Goal",
    activeGoals: "Active Goals",
    completedGoals: "Completed Goals",
    goalTitle: "Goal Title",
    description: "Description",
    targetAmount: "Target Amount",
    targetDate: "Target Date",
    category: "Category",
    priority: "Priority",
    monthlyContribution: "Monthly Contribution",
    autoContribute: "Auto Contribute",
    progress: "Progress",
    timeLeft: "Time Left",
    onTrack: "On Track",
    behindSchedule: "Behind Schedule",
    completed: "Completed",
    addMilestone: "Add Milestone",
    milestones: "Milestones",
    contribute: "Contribute",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    high: "High",
    medium: "Medium",
    low: "Low",
    days: "days",
    months: "months",
    years: "years",
    categories: {
      emergency: "Emergency Fund",
      vacation: "Vacation",
      car: "Car",
      house: "House",
      education: "Education",
      wedding: "Wedding",
      business: "Business",
      retirement: "Retirement",
      other: "Other",
    },
  },
}

const categoryIcons = {
  emergency: Heart,
  vacation: Plane,
  car: Car,
  house: Home,
  education: GraduationCap,
  wedding: Gift,
  business: Briefcase,
  retirement: Clock,
  other: Target,
}

export function FinancialGoals({ language, onBack }: FinancialGoalsProps) {
  const t = translations[language as keyof typeof translations] || translations.english
  const { user } = useAuth()
  const userId = user?.uid || ""
  
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null)
  const [contributingGoal, setContributingGoal] = useState<FinancialGoal | null>(null)
  const [contributionAmount, setContributionAmount] = useState("")
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetAmount: "",
    targetDate: "",
    category: "",
    priority: "medium" as const,
    monthlyContribution: "",
    autoContribute: false,
  })

  // Load goals from Firestore
  useEffect(() => {
    const loadGoals = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const userGoals = await getGoalsByUser(userId)
        setGoals(userGoals)
      } catch (error) {
        console.error("Error loading goals:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGoals()
  }, [userId])

  const activeGoals = goals.filter((goal) => !goal.isCompleted)
  const completedGoals = goals.filter((goal) => goal.isCompleted)

  const calculateTimeLeft = (targetDate: Date) => {
    const now = new Date()
    const diffTime = targetDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { value: Math.abs(diffDays), unit: "days overdue", isOverdue: true }
    if (diffDays < 30) return { value: diffDays, unit: t.days, isOverdue: false }
    if (diffDays < 365) return { value: Math.ceil(diffDays / 30), unit: t.months, isOverdue: false }
    return { value: Math.ceil(diffDays / 365), unit: t.years, isOverdue: false }
  }

  const getGoalStatus = (goal: FinancialGoal) => {
    if (goal.isCompleted) return "completed"

    const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100
    const timeLeft = calculateTimeLeft(goal.targetDate)
    const timeProgressPercentage =
      ((new Date().getTime() - goal.createdDate.getTime()) / (goal.targetDate.getTime() - goal.createdDate.getTime())) *
      100

    if (timeLeft.isOverdue) return "overdue"
    if (progressPercentage >= timeProgressPercentage - 10) return "onTrack"
    return "behindSchedule"
  }

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.targetDate || !userId) return

    try {
      const goalData = {
        userId,
        title: newGoal.title,
        description: newGoal.description,
        targetAmount: Number.parseFloat(newGoal.targetAmount),
        currentAmount: 0,
        category: newGoal.category,
        priority: newGoal.priority,
        targetDate: new Date(newGoal.targetDate),
        createdDate: new Date(),
        isCompleted: false,
        monthlyContribution: Number.parseFloat(newGoal.monthlyContribution) || 0,
        autoContribute: newGoal.autoContribute,
        milestones: [],
      }

      const goalId = await createGoalInFirestore(goalData)
      
      // Add to local state
      const newGoalWithId = { ...goalData, id: goalId }
      setGoals((prev) => [...prev, newGoalWithId])

      setNewGoal({
        title: "",
        description: "",
        targetAmount: "",
        targetDate: "",
        category: "",
        priority: "medium",
        monthlyContribution: "",
        autoContribute: false,
      })
      setIsAddingGoal(false)
    } catch (error) {
      console.error("Error creating goal:", error)
    }
  }

  const handleContribute = async () => {
    if (!contributingGoal || !contributionAmount) return

    try {
      const amount = Number.parseFloat(contributionAmount)
      
      // Update in Firestore
      await addGoalProgress(contributingGoal.id!, amount)

      // Update local state
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === contributingGoal.id
            ? {
                ...goal,
                currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount),
                isCompleted: goal.currentAmount + amount >= goal.targetAmount,
              }
            : goal,
        ),
      )

      setContributingGoal(null)
      setContributionAmount("")
    } catch (error) {
      console.error("Error adding contribution:", error)
    }
  }

  const handleDeleteGoal = async (goalId: string | undefined) => {
    if (!goalId) return
    
    if (!confirm("Are you sure you want to delete this goal?")) return

    try {
      await deleteGoalFromFirestore(goalId)
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId))
    } catch (error) {
      console.error("Error deleting goal:", error)
    }
  }

  const GoalCard = ({ goal }: { goal: FinancialGoal }) => {
    const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100
    const timeLeft = calculateTimeLeft(goal.targetDate)
    const status = getGoalStatus(goal)
    const CategoryIcon = categoryIcons[goal.category as keyof typeof categoryIcons] || Target

    // Mock progress data for chart
    const progressData = [
      { month: "Jan", amount: goal.currentAmount * 0.1 },
      { month: "Feb", amount: goal.currentAmount * 0.25 },
      { month: "Mar", amount: goal.currentAmount * 0.4 },
      { month: "Apr", amount: goal.currentAmount * 0.6 },
      { month: "May", amount: goal.currentAmount * 0.8 },
      { month: "Jun", amount: goal.currentAmount },
    ]

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full"
      >
        <Card
          className={`border-2 transition-all duration-300 hover:shadow-lg ${
            status === "completed"
              ? "border-secondary/50 bg-secondary/5"
              : status === "onTrack"
                ? "border-primary/50 bg-primary/5"
                : status === "overdue"
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-accent/50 bg-accent/5"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    status === "completed"
                      ? "bg-secondary/20"
                      : status === "onTrack"
                        ? "bg-primary/20"
                        : status === "overdue"
                          ? "bg-destructive/20"
                          : "bg-accent/20"
                  }`}
                >
                  <CategoryIcon
                    className={`w-6 h-6 ${
                      status === "completed"
                        ? "text-secondary-foreground"
                        : status === "onTrack"
                          ? "text-primary"
                          : status === "overdue"
                            ? "text-destructive"
                            : "text-accent-foreground"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    goal.priority === "high" ? "destructive" : goal.priority === "medium" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {t[goal.priority]}
                </Badge>
                {!goal.isCompleted && (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => setContributingGoal(goal)} className="h-8 px-2">
                      <IndianRupee className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingGoal(goal)} className="h-8 px-2">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="h-8 px-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            {/* Status and Time Left */}
            <div className="flex justify-between items-center">
              <Badge
                variant={
                  status === "completed"
                    ? "secondary"
                    : status === "onTrack"
                      ? "default"
                      : status === "overdue"
                        ? "destructive"
                        : "outline"
                }
                className="gap-1"
              >
                {status === "completed" ? (
                  <CheckCircle className="w-3 h-3" />
                ) : status === "onTrack" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : status === "overdue" ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {status === "completed"
                  ? t.completed
                  : status === "onTrack"
                    ? t.onTrack
                    : status === "overdue"
                      ? "Overdue"
                      : t.behindSchedule}
              </Badge>

              <div className="text-sm text-muted-foreground">
                {timeLeft.isOverdue ? (
                  <span className="text-destructive">
                    {timeLeft.value} {timeLeft.unit}
                  </span>
                ) : (
                  <span>
                    {timeLeft.value} {timeLeft.unit} {t.timeLeft}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Chart */}
            {!goal.isCompleted && (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--primary)"
                      fill="var(--primary)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Milestones */}
            {goal.milestones && goal.milestones.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">{t.milestones}</h4>
                <div className="space-y-1">
                  {goal.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {milestone.isCompleted ? (
                          <CheckCircle className="w-3 h-3 text-secondary-foreground" />
                        ) : (
                          <div className="w-3 h-3 border border-muted-foreground rounded-full" />
                        )}
                        <span className={milestone.isCompleted ? "text-secondary-foreground" : "text-muted-foreground"}>
                          {milestone.title}
                        </span>
                      </div>
                      <span className="text-muted-foreground">₹{milestone.targetAmount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Auto Contribution Info */}
            {goal.autoContribute && goal.monthlyContribution && goal.monthlyContribution > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                <Zap className="w-3 h-3 text-accent" />
                <span>Auto-contributing ₹{goal.monthlyContribution.toLocaleString()} monthly</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Loading financial goals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Target className="w-8 h-8" />
                {t.title}
              </h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>

          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {t.addGoal}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t.addGoal}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="goalTitle">{t.goalTitle}</Label>
                  <Input
                    id="goalTitle"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter goal title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">{t.description}</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your goal"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="targetAmount">{t.targetAmount}</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal((prev) => ({ ...prev, targetAmount: e.target.value }))}
                    placeholder="Enter target amount"
                  />
                </div>

                <div>
                  <Label htmlFor="targetDate">{t.targetDate}</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal((prev) => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="category">{t.category}</Label>
                  <Select
                    value={newGoal.category}
                    onValueChange={(value) => setNewGoal((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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

                <div>
                  <Label htmlFor="priority">{t.priority}</Label>
                  <Select
                    value={newGoal.priority}
                    onValueChange={(value: any) => setNewGoal((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{t.high}</SelectItem>
                      <SelectItem value="medium">{t.medium}</SelectItem>
                      <SelectItem value="low">{t.low}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="monthlyContribution">{t.monthlyContribution}</Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    value={newGoal.monthlyContribution}
                    onChange={(e) => setNewGoal((prev) => ({ ...prev, monthlyContribution: e.target.value }))}
                    placeholder="Optional monthly contribution"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddGoal} className="flex-1">
                    {t.save}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingGoal(false)} className="flex-1">
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.activeGoals}</p>
                  <p className="text-xl font-bold text-primary">{activeGoals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.completedGoals}</p>
                  <p className="text-xl font-bold text-secondary-foreground">{completedGoals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-xl font-bold text-accent-foreground">
                    ₹{activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Amount</p>
                  <p className="text-xl font-bold text-muted-foreground">
                    ₹{activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Target className="w-5 h-5" />
                  {t.activeGoals} ({activeGoals.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence>
                  {activeGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-2 border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                  <CheckCircle className="w-5 h-5" />
                  {t.completedGoals} ({completedGoals.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence>
                  {completedGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Contribution Dialog */}
        <Dialog open={!!contributingGoal} onOpenChange={() => setContributingGoal(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t.contribute}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Goal: {contributingGoal?.title}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Current: ₹{contributingGoal?.currentAmount.toLocaleString()} / ₹
                  {contributingGoal?.targetAmount.toLocaleString()}
                </p>
                <Label htmlFor="contributionAmount">Contribution Amount</Label>
                <Input
                  id="contributionAmount"
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="Enter amount to contribute"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleContribute} className="flex-1">
                  {t.contribute}
                </Button>
                <Button variant="outline" onClick={() => setContributingGoal(null)} className="flex-1">
                  {t.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
