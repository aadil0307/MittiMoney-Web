"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Send,
  IndianRupee,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Building,
  Shield,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Scan,
} from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

interface UPITransaction {
  id: string
  type: "sent" | "received" | "bill_payment" | "merchant"
  amount: number
  recipient: string
  recipientUPI?: string
  description: string
  status: "pending" | "completed" | "failed"
  timestamp: Date
  transactionId: string
  category: string
}

interface Contact {
  id: string
  name: string
  upiId: string
  phone: string
  isFrequent: boolean
}

interface UPIPaymentGatewayProps {
  language: string
  onBack: () => void
}

const translations = {
  hindi: {
    title: "UPI भुगतान गेटवे",
    subtitle: "तुरंत पैसे भेजें, प्राप्त करें और बिल भुगतान करें",
    sendMoney: "पैसे भेजें",
    requestMoney: "पैसे मांगें",
    scanQR: "QR स्कैन करें",
    payBills: "बिल भुगतान",
    recentTransactions: "हाल की लेनदेन",
    quickSend: "त्वरित भेजें",
    amount: "राशि",
    recipient: "प्राप्तकर्ता",
    upiId: "UPI ID",
    phoneNumber: "फोन नंबर",
    description: "विवरण",
    send: "भेजें",
    request: "अनुरोध करें",
    cancel: "रद्द करें",
    pending: "लंबित",
    completed: "पूर्ण",
    failed: "असफल",
    sent: "भेजा गया",
    received: "प्राप्त",
    billPayment: "बिल भुगतान",
    merchant: "व्यापारी",
    balance: "शेष राशि",
    transactionLimit: "लेनदेन सीमा",
    dailyLimit: "दैनिक सीमा",
    monthlyLimit: "मासिक सीमा",
    securePayment: "सुरक्षित भुगतान",
    instantTransfer: "तत्काल स्थानांतरण",
    frequentContacts: "बार-बार संपर्क",
    addContact: "संपर्क जोड़ें",
    paymentMethods: "भुगतान विधियां",
    bankAccount: "बैंक खाता",
    wallet: "वॉलेट",
  },
  english: {
    title: "UPI Payment Gateway",
    subtitle: "Send, receive money and pay bills instantly",
    sendMoney: "Send Money",
    requestMoney: "Request Money",
    scanQR: "Scan QR",
    payBills: "Pay Bills",
    recentTransactions: "Recent Transactions",
    quickSend: "Quick Send",
    amount: "Amount",
    recipient: "Recipient",
    upiId: "UPI ID",
    phoneNumber: "Phone Number",
    description: "Description",
    send: "Send",
    request: "Request",
    cancel: "Cancel",
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
    sent: "Sent",
    received: "Received",
    billPayment: "Bill Payment",
    merchant: "Merchant",
    balance: "Balance",
    transactionLimit: "Transaction Limit",
    dailyLimit: "Daily Limit",
    monthlyLimit: "Monthly Limit",
    securePayment: "Secure Payment",
    instantTransfer: "Instant Transfer",
    frequentContacts: "Frequent Contacts",
    addContact: "Add Contact",
    paymentMethods: "Payment Methods",
    bankAccount: "Bank Account",
    wallet: "Wallet",
  },
}

export function UPIPaymentGateway({ language, onBack }: UPIPaymentGatewayProps) {
  // Temporarily disabled due to corrupted file - needs reconstruction
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold text-primary mb-4">UPI Payment Gateway</h1>
          <p className="text-muted-foreground mb-8">This feature is currently under reconstruction</p>
          <button 
            onClick={onBack} 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            ← Go Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
  const [transactions, setTransactions] = useState<UPITransaction[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentType, setPaymentType] = useState<"send" | "request">("send")
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    recipient: "",
    upiId: "",
    description: "",
    method: "upi",
  })
  const [upiBalance, setUpiBalance] = useState(25000)
  const [dailyLimit] = useState(100000)
  const [monthlyLimit] = useState(1000000)
  const [dailyUsed] = useState(15000)
  const [monthlyUsed] = useState(125000)

  // Mock data initialization
  useEffect(() => {
    const mockTransactions: UPITransaction[] = [
      {
        id: "1",
        type: "sent",
        amount: 500,
        recipient: "Rajesh Kumar",
        recipientUPI: "rajesh@paytm",
        description: "Lunch payment",
        status: "completed",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        transactionId: "UPI123456789",
        category: "food",
      },
      {
        id: "2",
        type: "received",
        amount: 2000,
        recipient: "Priya Sharma",
        recipientUPI: "priya@gpay",
        description: "Rent share",
        status: "completed",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        transactionId: "UPI987654321",
        category: "transfer",
      },
      {
        id: "3",
        type: "bill_payment",
        amount: 1200,
        recipient: "Electricity Board",
        description: "Monthly electricity bill",
        status: "completed",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
        transactionId: "UPI456789123",
        category: "utilities",
      },
      {
        id: "4",
        type: "merchant",
        amount: 350,
        recipient: "Swiggy",
        description: "Food delivery",
        status: "pending",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        transactionId: "UPI789123456",
        category: "food",
      },
    ]

    const mockContacts: Contact[] = [
      { id: "1", name: "Rajesh Kumar", upiId: "rajesh@paytm", phone: "+91 98765 43210", isFrequent: true },
      { id: "2", name: "Priya Sharma", upiId: "priya@gpay", phone: "+91 87654 32109", isFrequent: true },
      { id: "3", name: "Amit Singh", upiId: "amit@phonepe", phone: "+91 76543 21098", isFrequent: true },
      { id: "4", name: "Neha Gupta", upiId: "neha@paytm", phone: "+91 65432 10987", isFrequent: false },
    ]

    setTransactions(mockTransactions)
    setContacts(mockContacts)
  }, [])

  const frequentContacts = contacts.filter((contact) => contact.isFrequent)

  const handlePayment = () => {
    if (!paymentForm.amount || !paymentForm.recipient) return

    const newTransaction: UPITransaction = {
      id: Date.now().toString(),
      type: paymentType === "send" ? "sent" : "received",
      amount: Number.parseFloat(paymentForm.amount),
      recipient: paymentForm.recipient,
      recipientUPI: paymentForm.upiId,
      description: paymentForm.description || "Payment",
      status: "pending",
      timestamp: new Date(),
      transactionId: `UPI${Date.now()}`,
      category: "transfer",
    }

    setTransactions((prev) => [newTransaction, ...prev])

    // Simulate payment processing
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === newTransaction.id ? { ...t, status: "completed" as const } : t)),
      )
      if (paymentType === "send") {
        setUpiBalance((prev) => prev - newTransaction.amount)
      }
    }, 2000)

    setPaymentForm({
      amount: "",
      recipient: "",
      upiId: "",
      description: "",
      method: "upi",
    })
    setIsPaymentDialogOpen(false)
  }

  const getTransactionIcon = (type: string, status: string) => {
    if (status === "pending") return <Clock className="w-4 h-4 text-accent" />
    if (status === "failed") return <AlertTriangle className="w-4 h-4 text-destructive" />

    switch (type) {
      case "sent":
        return <ArrowUpRight className="w-4 h-4 text-red-600" />
      case "received":
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />
      case "bill_payment":
        return <Building className="w-4 h-4 text-blue-600" />
      case "merchant":
        return <CreditCard className="w-4 h-4 text-purple-600" />
      default:
        return <IndianRupee className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            {t.completed}
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {t.pending}
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {t.failed}
          </Badge>
        )
      default:
        return null
    }
  }

  const TransactionCard = ({ transaction }: { transaction: UPITransaction }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="border-2 border-border/50 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted/30 rounded-full flex items-center justify-center">
                {getTransactionIcon(transaction.type, transaction.status)}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{transaction.recipient}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{transaction.description}</span>
                  {transaction.recipientUPI && (
                    <>
                      <span>•</span>
                      <span>{transaction.recipientUPI}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{transaction.timestamp.toLocaleString()}</p>
              </div>
            </div>

            <div className="text-right">
              <div
                className={`text-lg font-bold ${
                  transaction.type === "received" ? "text-green-600" : "text-red-600"
                }`}
              >
                {transaction.type === "received" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
              </div>
              {getStatusBadge(transaction.status)}
              <p className="text-xs text-muted-foreground mt-1">ID: {transaction.transactionId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Main component return
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
                <CreditCard className="w-8 h-8" />
                {t.title}
              </h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Balance & Limits Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.balance}</p>
                  <p className="text-xl font-bold text-primary">₹{upiBalance.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">{t.dailyLimit}</p>
                  <p className="text-sm font-bold text-accent-foreground">
                    ₹{dailyUsed.toLocaleString()} / ₹{dailyLimit.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.monthlyLimit}</p>
                  <p className="text-sm font-bold text-secondary-foreground">
                    ₹{monthlyUsed.toLocaleString()} / ₹{monthlyLimit.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted/20 rounded-full flex items-center justify-center">
                  <History className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-xl font-bold text-muted-foreground">{transactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Card
                className="border-2 border-primary/20 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setPaymentType("send")}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Send className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{t.sendMoney}</h3>
                </CardContent>
              </Card>
            </DialogTrigger>
          </Dialog>

          <Card
            className="border-2 border-accent/20 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              setPaymentType("request")
              setIsPaymentDialogOpen(true)
            }}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                <ArrowDownLeft className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold">{t.requestMoney}</h3>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                <Scan className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold">{t.scanQR}</h3>
            </CardContent>
          </Card>

          <Card className="border-2 border-muted/20 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                <Building className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">{t.payBills}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Frequent Contacts */}
        {frequentContacts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {t.frequentContacts}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {frequentContacts.map((contact) => (
                    <Card
                      key={contact.id}
                      className="border border-border/30 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setPaymentForm((prev) => ({
                          ...prev,
                          recipient: contact.name,
                          upiId: contact.upiId,
                        }))
                        setPaymentType("send")
                        setIsPaymentDialogOpen(true)
                      }}
                    >
                      <CardContent className="p-3 text-center">
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.upiId}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  */
}
