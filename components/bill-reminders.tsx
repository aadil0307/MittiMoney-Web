"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Plus,
  IndianRupee,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Wifi,
  Home,
  Phone,
  CreditCard,
  Edit,
  Trash2,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface Bill {
  id: string
  name: string
  amount: number
  category: string
  dueDate: Date
  frequency: "monthly" | "quarterly" | "yearly" | "weekly"
  isPaid: boolean
  isRecurring: boolean
  reminderDays: number
  autoPayEnabled: boolean
  lastPaid?: Date
  nextDue: Date
}

interface BillRemindersProps {
  language: string
  onBack: () => void
}

const translations = {
  hindi: {
    title: "बिल रिमाइंडर",
    addBill: "नया बिल जोड़ें",
    upcomingBills: "आने वाले बिल",
    overdueBills: "बकाया बिल",
    paidBills: "भुगतान किए गए बिल",
    billName: "बिल का नाम",
    amount: "राशि",
    category: "श्रेणी",
    dueDate: "देय तिथि",
    frequency: "आवृत्ति",
    reminderDays: "रिमाइंडर दिन",
    autoPayEnabled: "ऑटो पे सक्षम",
    markAsPaid: "भुगतान के रूप में चिह्नित करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    save: "सहेजें",
    cancel: "रद्द करें",
    monthly: "मासिक",
    quarterly: "त्रैमासिक",
    yearly: "वार्षिक",
    weekly: "साप्ताहिक",
    electricity: "बिजली",
    water: "पानी",
    gas: "गैस",
    internet: "इंटरनेट",
    phone: "फोन",
    rent: "किराया",
    insurance: "बीमा",
    loan: "ऋण",
    other: "अन्य",
    daysLeft: "दिन बचे",
    overdue: "बकाया",
    paid: "भुगतान किया गया",
    totalMonthlyBills: "कुल मासिक बिल",
    notifications: "सूचनाएं",
  },
  english: {
    title: "Bill Reminders",
    addBill: "Add New Bill",
    upcomingBills: "Upcoming Bills",
    overdueBills: "Overdue Bills",
    paidBills: "Paid Bills",
    billName: "Bill Name",
    amount: "Amount",
    category: "Category",
    dueDate: "Due Date",
    frequency: "Frequency",
    reminderDays: "Reminder Days",
    autoPayEnabled: "Auto Pay Enabled",
    markAsPaid: "Mark as Paid",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
    weekly: "Weekly",
    electricity: "Electricity",
    water: "Water",
    gas: "Gas",
    internet: "Internet",
    phone: "Phone",
    rent: "Rent",
    insurance: "Insurance",
    loan: "Loan",
    other: "Other",
    daysLeft: "days left",
    overdue: "Overdue",
    paid: "Paid",
    totalMonthlyBills: "Total Monthly Bills",
    notifications: "Notifications",
  },
}

const categoryIcons = {
  electricity: Zap,
  water: Home,
  gas: Home,
  internet: Wifi,
  phone: Phone,
  rent: Home,
  insurance: CreditCard,
  loan: CreditCard,
  other: Bell,
}

export function BillReminders({ language, onBack }: BillRemindersProps) {
  const t = translations[language as keyof typeof translations] || translations.english
  const [bills, setBills] = useState<Bill[]>([])
  const [isAddingBill, setIsAddingBill] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    category: "",
    dueDate: "",
    frequency: "monthly" as const,
    reminderDays: 3,
    autoPayEnabled: false,
  })

  // Mock data initialization
  useEffect(() => {
    const mockBills: Bill[] = [
      {
        id: "1",
        name: "Electricity Bill",
        amount: 2500,
        category: "electricity",
        dueDate: new Date("2024-01-15"),
        frequency: "monthly",
        isPaid: false,
        isRecurring: true,
        reminderDays: 3,
        autoPayEnabled: false,
        nextDue: new Date("2024-01-15"),
      },
      {
        id: "2",
        name: "Internet Bill",
        amount: 1200,
        category: "internet",
        dueDate: new Date("2024-01-10"),
        frequency: "monthly",
        isPaid: true,
        isRecurring: true,
        reminderDays: 5,
        autoPayEnabled: true,
        lastPaid: new Date("2024-01-08"),
        nextDue: new Date("2024-02-10"),
      },
      {
        id: "3",
        name: "House Rent",
        amount: 15000,
        category: "rent",
        dueDate: new Date("2024-01-05"),
        frequency: "monthly",
        isPaid: false,
        isRecurring: true,
        reminderDays: 7,
        autoPayEnabled: false,
        nextDue: new Date("2024-01-05"),
      },
    ]
    setBills(mockBills)
  }, [])

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const upcomingBills = bills.filter((bill) => !bill.isPaid && getDaysUntilDue(bill.nextDue) >= 0)
  const overdueBills = bills.filter((bill) => !bill.isPaid && getDaysUntilDue(bill.nextDue) < 0)
  const paidBills = bills.filter((bill) => bill.isPaid)

  const totalMonthlyAmount = bills
    .filter((bill) => bill.frequency === "monthly")
    .reduce((sum, bill) => sum + bill.amount, 0)

  const handleAddBill = () => {
    if (!newBill.name || !newBill.amount || !newBill.category || !newBill.dueDate) return

    const bill: Bill = {
      id: Date.now().toString(),
      name: newBill.name,
      amount: Number.parseFloat(newBill.amount),
      category: newBill.category,
      dueDate: new Date(newBill.dueDate),
      frequency: newBill.frequency,
      isPaid: false,
      isRecurring: true,
      reminderDays: newBill.reminderDays,
      autoPayEnabled: newBill.autoPayEnabled,
      nextDue: new Date(newBill.dueDate),
    }

    setBills((prev) => [...prev, bill])
    setNewBill({
      name: "",
      amount: "",
      category: "",
      dueDate: "",
      frequency: "monthly",
      reminderDays: 3,
      autoPayEnabled: false,
    })
    setIsAddingBill(false)
  }

  const handleMarkAsPaid = (billId: string) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              isPaid: true,
              lastPaid: new Date(),
              nextDue: getNextDueDate(bill.nextDue, bill.frequency),
            }
          : bill,
      ),
    )
  }

  const getNextDueDate = (currentDue: Date, frequency: string) => {
    const nextDue = new Date(currentDue)
    switch (frequency) {
      case "weekly":
        nextDue.setDate(nextDue.getDate() + 7)
        break
      case "monthly":
        nextDue.setMonth(nextDue.getMonth() + 1)
        break
      case "quarterly":
        nextDue.setMonth(nextDue.getMonth() + 3)
        break
      case "yearly":
        nextDue.setFullYear(nextDue.getFullYear() + 1)
        break
    }
    return nextDue
  }

  const handleDeleteBill = (billId: string) => {
    setBills((prev) => prev.filter((bill) => bill.id !== billId))
  }

  const BillCard = ({ bill }: { bill: Bill }) => {
    const daysLeft = getDaysUntilDue(bill.nextDue)
    const isOverdue = daysLeft < 0
    const CategoryIcon = categoryIcons[bill.category as keyof typeof categoryIcons] || Bell

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full"
      >
        <Card
          className={`border-2 transition-all duration-300 hover:shadow-lg ${
            isOverdue
              ? "border-destructive/50 bg-destructive/5"
              : daysLeft <= bill.reminderDays
                ? "border-accent/50 bg-accent/5"
                : bill.isPaid
                  ? "border-secondary/50 bg-secondary/5"
                  : "border-border/50"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isOverdue ? "bg-destructive/20" : bill.isPaid ? "bg-secondary/20" : "bg-primary/20"
                  }`}
                >
                  <CategoryIcon
                    className={`w-5 h-5 ${
                      isOverdue ? "text-destructive" : bill.isPaid ? "text-secondary-foreground" : "text-primary"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{bill.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="w-3 h-3" />
                    <span>{bill.amount.toLocaleString()}</span>
                    <span>•</span>
                    <span className="capitalize">{t[bill.frequency as keyof typeof t]}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {bill.isPaid ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {t.paid}
                  </Badge>
                ) : isOverdue ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {t.overdue}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {Math.abs(daysLeft)} {t.daysLeft}
                  </Badge>
                )}

                <div className="flex gap-1">
                  {!bill.isPaid && (
                    <Button size="sm" onClick={() => handleMarkAsPaid(bill.id)} className="h-8 px-2">
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setEditingBill(bill)} className="h-8 px-2">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteBill(bill.id)}
                    className="h-8 px-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {bill.autoPayEnabled && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="w-3 h-3 text-accent" />
                <span>Auto-pay enabled</span>
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
              <h1 className="text-3xl font-bold text-primary">{t.title}</h1>
              <p className="text-muted-foreground">Manage your recurring bills and payments</p>
            </div>
          </div>

          <Dialog open={isAddingBill} onOpenChange={setIsAddingBill}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {t.addBill}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t.addBill}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="billName">{t.billName}</Label>
                  <Input
                    id="billName"
                    value={newBill.name}
                    onChange={(e) => setNewBill((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter bill name"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">{t.amount}</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newBill.amount}
                    onChange={(e) => setNewBill((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <Label htmlFor="category">{t.category}</Label>
                  <Select
                    value={newBill.category}
                    onValueChange={(value) => setNewBill((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electricity">{t.electricity}</SelectItem>
                      <SelectItem value="water">{t.water}</SelectItem>
                      <SelectItem value="gas">{t.gas}</SelectItem>
                      <SelectItem value="internet">{t.internet}</SelectItem>
                      <SelectItem value="phone">{t.phone}</SelectItem>
                      <SelectItem value="rent">{t.rent}</SelectItem>
                      <SelectItem value="insurance">{t.insurance}</SelectItem>
                      <SelectItem value="loan">{t.loan}</SelectItem>
                      <SelectItem value="other">{t.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dueDate">{t.dueDate}</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newBill.dueDate}
                    onChange={(e) => setNewBill((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="frequency">{t.frequency}</Label>
                  <Select
                    value={newBill.frequency}
                    onValueChange={(value: any) => setNewBill((prev) => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">{t.weekly}</SelectItem>
                      <SelectItem value="monthly">{t.monthly}</SelectItem>
                      <SelectItem value="quarterly">{t.quarterly}</SelectItem>
                      <SelectItem value="yearly">{t.yearly}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reminderDays">{t.reminderDays}</Label>
                  <Input
                    id="reminderDays"
                    type="number"
                    value={newBill.reminderDays}
                    onChange={(e) =>
                      setNewBill((prev) => ({ ...prev, reminderDays: Number.parseInt(e.target.value) || 3 }))
                    }
                    min="1"
                    max="30"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoPay"
                    checked={newBill.autoPayEnabled}
                    onCheckedChange={(checked) => setNewBill((prev) => ({ ...prev, autoPayEnabled: checked }))}
                  />
                  <Label htmlFor="autoPay">{t.autoPayEnabled}</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddBill} className="flex-1">
                    {t.save}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingBill(false)} className="flex-1">
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.totalMonthlyBills}</p>
                  <p className="text-xl font-bold text-primary">₹{totalMonthlyAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.upcomingBills}</p>
                  <p className="text-xl font-bold text-accent-foreground">{upcomingBills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.overdueBills}</p>
                  <p className="text-xl font-bold text-destructive">{overdueBills.length}</p>
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
                  <p className="text-sm text-muted-foreground">{t.paidBills}</p>
                  <p className="text-xl font-bold text-secondary-foreground">{paidBills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bills Sections */}
        <div className="space-y-6">
          {/* Overdue Bills */}
          {overdueBills.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-2 border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    {t.overdueBills} ({overdueBills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AnimatePresence>
                    {overdueBills.map((bill) => (
                      <BillCard key={bill.id} bill={bill} />
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Upcoming Bills */}
          {upcomingBills.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-2 border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent-foreground">
                    <Clock className="w-5 h-5" />
                    {t.upcomingBills} ({upcomingBills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AnimatePresence>
                    {upcomingBills.map((bill) => (
                      <BillCard key={bill.id} bill={bill} />
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Paid Bills */}
          {paidBills.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-2 border-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                    <CheckCircle className="w-5 h-5" />
                    {t.paidBills} ({paidBills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AnimatePresence>
                    {paidBills.map((bill) => (
                      <BillCard key={bill.id} bill={bill} />
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
