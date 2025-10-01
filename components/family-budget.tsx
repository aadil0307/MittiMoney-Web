"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  Plus,
  Settings,
  PieChart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Home,
  Car,
  ShoppingCart,
  Utensils,
  Zap,
  Heart,
  GraduationCap,
  Gamepad2,
} from "lucide-react"

interface FamilyMember {
  id: string
  name: string
  avatar: string
  role: "admin" | "member" | "child"
  contribution: number
  allowance?: number
}

interface SharedExpense {
  id: string
  title: string
  amount: number
  category: string
  paidBy: string
  splitBetween: string[]
  date: string
  status: "pending" | "approved" | "settled"
  receipt?: string
}

interface HouseholdBudget {
  category: string
  allocated: number
  spent: number
  icon: any
  color: string
}

export default function FamilyBudget() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)

  const [familyMembers] = useState<FamilyMember[]>([
    { id: "1", name: "Rajesh Kumar", avatar: "/avatars/rajesh.jpg", role: "admin", contribution: 45000 },
    { id: "2", name: "Priya Kumar", avatar: "/avatars/priya.jpg", role: "admin", contribution: 35000 },
    { id: "3", name: "Arjun Kumar", avatar: "/avatars/arjun.jpg", role: "child", contribution: 0, allowance: 2000 },
    { id: "4", name: "Kavya Kumar", avatar: "/avatars/kavya.jpg", role: "child", contribution: 0, allowance: 1500 },
  ])

  const [sharedExpenses] = useState<SharedExpense[]>([
    {
      id: "1",
      title: "Grocery Shopping - BigBasket",
      amount: 4500,
      category: "Food",
      paidBy: "Priya Kumar",
      splitBetween: ["1", "2"],
      date: "2024-01-15",
      status: "approved",
    },
    {
      id: "2",
      title: "Electricity Bill",
      amount: 3200,
      category: "Utilities",
      paidBy: "Rajesh Kumar",
      splitBetween: ["1", "2"],
      date: "2024-01-14",
      status: "settled",
    },
    {
      id: "3",
      title: "School Fees - Arjun",
      amount: 15000,
      category: "Education",
      paidBy: "Rajesh Kumar",
      splitBetween: ["1", "2"],
      date: "2024-01-13",
      status: "pending",
    },
  ])

  const [householdBudgets] = useState<HouseholdBudget[]>([
    { category: "Housing", allocated: 25000, spent: 22000, icon: Home, color: "bg-blue-500" },
    { category: "Food", allocated: 15000, spent: 12500, icon: Utensils, color: "bg-green-500" },
    { category: "Transportation", allocated: 8000, spent: 6800, icon: Car, color: "bg-yellow-500" },
    { category: "Utilities", allocated: 5000, spent: 4200, icon: Zap, color: "bg-purple-500" },
    { category: "Healthcare", allocated: 3000, spent: 1800, icon: Heart, color: "bg-red-500" },
    { category: "Education", allocated: 20000, spent: 15000, icon: GraduationCap, color: "bg-indigo-500" },
    { category: "Entertainment", allocated: 4000, spent: 2800, icon: Gamepad2, color: "bg-pink-500" },
    { category: "Shopping", allocated: 6000, spent: 4500, icon: ShoppingCart, color: "bg-orange-500" },
  ])

  const totalIncome = familyMembers.reduce((sum, member) => sum + member.contribution, 0)
  const totalAllocated = householdBudgets.reduce((sum, budget) => sum + budget.allocated, 0)
  const totalSpent = householdBudgets.reduce((sum, budget) => sum + budget.spent, 0)
  const savingsRate = ((totalIncome - totalSpent) / totalIncome) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Family Budget</h1>
          <p className="text-muted-foreground">Manage household finances together</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter member name" />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contribution">Monthly Contribution</Label>
                  <Input id="contribution" type="number" placeholder="0" />
                </div>
                <Button className="w-full">Add Member</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Family Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-foreground">₹{totalIncome.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">₹{totalSpent.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Savings Rate</p>
                <p className="text-2xl font-bold text-foreground">{savingsRate.toFixed(1)}%</p>
              </div>
              <PieChart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Family Members</p>
                <p className="text-2xl font-bold text-foreground">{familyMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="expenses">Shared Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Category Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Budget Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Household Budget Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {householdBudgets.map((budget) => {
                  const Icon = budget.icon
                  const percentage = (budget.spent / budget.allocated) * 100
                  const isOverBudget = percentage > 100

                  return (
                    <div key={budget.category} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className={`p-3 rounded-full ${budget.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-foreground">{budget.category}</h3>
                          <span
                            className={`text-sm font-medium ${isOverBudget ? "text-red-500" : "text-muted-foreground"}`}
                          >
                            ₹{budget.spent.toLocaleString()} / ₹{budget.allocated.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={Math.min(percentage, 100)} className="h-2" />
                        {isOverBudget && (
                          <p className="text-xs text-red-500 mt-1">
                            Over budget by ₹{(budget.spent - budget.allocated).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Shared Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Shared Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sharedExpenses.slice(0, 3).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-full">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{expense.title}</h3>
                        <p className="text-sm text-muted-foreground">Paid by {expense.paidBy}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">₹{expense.amount.toLocaleString()}</p>
                      <Badge
                        variant={
                          expense.status === "settled"
                            ? "default"
                            : expense.status === "approved"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {expense.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Family Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-foreground">{member.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={member.role === "admin" ? "default" : "secondary"}>{member.role}</Badge>
                          {member.role === "child" && member.allowance && (
                            <Badge variant="outline">Allowance: ₹{member.allowance}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {member.contribution > 0 ? (
                        <>
                          <p className="font-medium text-foreground">₹{member.contribution.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Monthly contribution</p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">No contribution</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Shared Expenses</h2>
            <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Shared Expense</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Expense Title</Label>
                    <Input id="title" placeholder="Enter expense description" />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paidBy">Paid By</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {familyMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Split Between</Label>
                    <div className="space-y-2 mt-2">
                      {familyMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Switch id={`split-${member.id}`} />
                          <Label htmlFor={`split-${member.id}`}>{member.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">Add Expense</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {sharedExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-6 border-b last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-full">
                        {expense.status === "settled" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : expense.status === "approved" ? (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{expense.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} • Paid by {expense.paidBy} • {expense.date}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Split between {expense.splitBetween.length} members
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">₹{expense.amount.toLocaleString()}</p>
                      <Badge
                        variant={
                          expense.status === "settled"
                            ? "default"
                            : expense.status === "approved"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {expense.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Category Budgets</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {householdBudgets.map((budget) => {
              const Icon = budget.icon
              const percentage = (budget.spent / budget.allocated) * 100
              const isOverBudget = percentage > 100
              const remaining = budget.allocated - budget.spent

              return (
                <Card key={budget.category}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${budget.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-lg">{budget.category}</CardTitle>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="font-medium">₹{budget.spent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">₹{budget.allocated.toLocaleString()}</span>
                      </div>
                      <Progress value={Math.min(percentage, 100)} className="h-3" />
                      <div className="flex justify-between text-sm">
                        <span
                          className={`font-medium ${isOverBudget ? "text-red-500" : remaining < budget.allocated * 0.2 ? "text-yellow-500" : "text-green-500"}`}
                        >
                          {isOverBudget ? "Over budget" : "Remaining"}
                        </span>
                        <span className={`font-medium ${isOverBudget ? "text-red-500" : "text-foreground"}`}>
                          ₹{Math.abs(remaining).toLocaleString()}
                        </span>
                      </div>
                      {isOverBudget && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">
                            You've exceeded your budget by ₹{(budget.spent - budget.allocated).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
