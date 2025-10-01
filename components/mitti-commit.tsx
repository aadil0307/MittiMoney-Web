"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Plus,
  IndianRupee,
  Calendar,
  Shield,
  CheckCircle,
  Share,
  Eye,
  UserPlus,
  Coins,
  Lock,
} from "lucide-react"

interface ChitFund {
  id: string
  name: string
  totalAmount: number
  monthlyContribution: number
  duration: number // in months
  currentMonth: number
  members: ChitMember[]
  maxMembers: number
  status: "recruiting" | "active" | "completed"
  createdBy: string
  createdAt: Date
  nextPayoutDate: Date
  contractAddress?: string
  isPrivate: boolean
  inviteCode?: string
}

interface ChitMember {
  id: string
  name: string
  walletAddress: string
  contributionsPaid: number
  hasReceivedPayout: boolean
  payoutMonth?: number
  joinedAt: Date
}

interface MittiCommitProps {
  selectedLanguage: string
  onBack: () => void
}

const languageTexts = {
  hi: {
    title: "मिट्टी कमिट",
    subtitle: "ब्लॉकचेन आधारित डिजिटल चिट फंड",
    createGroup: "नया ग्रुप बनाएं",
    joinGroup: "ग्रुप जॉइन करें",
    groupName: "ग्रुप का नाम",
    totalAmount: "कुल राशि",
    monthlyContribution: "मासिक योगदान",
    duration: "अवधि (महीने)",
    maxMembers: "अधिकतम सदस्य",
    inviteCode: "इनवाइट कोड",
    makePrivate: "प्राइवेट बनाएं",
    create: "बनाएं",
    join: "जॉइन करें",
    cancel: "रद्द करें",
    members: "सदस्य",
    recruiting: "सदस्य भर्ती",
    active: "सक्रिय",
    completed: "पूर्ण",
    contribute: "योगदान दें",
    viewDetails: "विवरण देखें",
    shareInvite: "इनवाइट शेयर करें",
    nextPayout: "अगला भुगतान",
    myContributions: "मेरे योगदान",
    totalContributions: "कुल योगदान",
    payoutReceived: "भुगतान प्राप्त",
    pendingPayout: "भुगतान बकाया",
    trustScore: "ट्रस्ट स्कोर",
    blockchainVerified: "ब्लॉकचेन सत्यापित",
    transparentLedger: "पारदर्शी खाता",
    noGroups: "कोई ग्रुप नहीं",
    joinFirstGroup: "अपना पहला ग्रुप जॉइन करें",
    congratulations: "बधाई हो!",
    payoutSuccess: "भुगतान सफल!",
    contractDeployed: "कॉन्ट्रैक्ट तैनात",
  },
  en: {
    title: "MittiCommit",
    subtitle: "Blockchain-based Digital Chit Funds",
    createGroup: "Create New Group",
    joinGroup: "Join Group",
    groupName: "Group Name",
    totalAmount: "Total Amount",
    monthlyContribution: "Monthly Contribution",
    duration: "Duration (Months)",
    maxMembers: "Max Members",
    inviteCode: "Invite Code",
    makePrivate: "Make Private",
    create: "Create",
    join: "Join",
    cancel: "Cancel",
    members: "Members",
    recruiting: "Recruiting",
    active: "Active",
    completed: "Completed",
    contribute: "Contribute",
    viewDetails: "View Details",
    shareInvite: "Share Invite",
    nextPayout: "Next Payout",
    myContributions: "My Contributions",
    totalContributions: "Total Contributions",
    payoutReceived: "Payout Received",
    pendingPayout: "Pending Payout",
    trustScore: "Trust Score",
    blockchainVerified: "Blockchain Verified",
    transparentLedger: "Transparent Ledger",
    noGroups: "No Groups",
    joinFirstGroup: "Join your first group",
    congratulations: "Congratulations!",
    payoutSuccess: "Payout Successful!",
    contractDeployed: "Contract Deployed",
  },
  mr: {
    title: "मिट्टी कमिट",
    subtitle: "ब्लॉकचेन आधारित डिजिटल चिट फंड",
    createGroup: "नवीन ग्रुप तयार करा",
    joinGroup: "ग्रुप जॉइन करा",
    groupName: "ग्रुपचे नाव",
    totalAmount: "एकूण रक्कम",
    monthlyContribution: "मासिक योगदान",
    duration: "कालावधी (महिने)",
    maxMembers: "कमाल सदस्य",
    inviteCode: "इन्व्हाइट कोड",
    makePrivate: "प्रायव्हेट बनवा",
    create: "तयार करा",
    join: "जॉइन करा",
    cancel: "रद्द करा",
    members: "सदस्य",
    recruiting: "सदस्य भरती",
    active: "सक्रिय",
    completed: "पूर्ण",
    contribute: "योगदान द्या",
    viewDetails: "तपशील पहा",
    shareInvite: "इन्व्हाइट शेअर करा",
    nextPayout: "पुढील पेमेंट",
    myContributions: "माझे योगदान",
    totalContributions: "एकूण योगदान",
    payoutReceived: "पेमेंट मिळाले",
    pendingPayout: "पेमेंट बाकी",
    trustScore: "ट्रस्ट स्कोअर",
    blockchainVerified: "ब्लॉकचेन सत्यापित",
    transparentLedger: "पारदर्शक खाते",
    noGroups: "कोणतेही ग्रुप नाहीत",
    joinFirstGroup: "तुमचा पहिला ग्रुप जॉइन करा",
    congratulations: "अभिनंदन!",
    payoutSuccess: "पेमेंट यशस्वी!",
    contractDeployed: "कॉन्ट्रॅक्ट तैनात",
  },
  ta: {
    title: "மிட்டி கமிட்",
    subtitle: "பிளாக்செயின் அடிப்படையிலான டிஜிட்டல் சிட் ஃபண்ட்",
    createGroup: "புதிய குழு உருவாக்கவும்",
    joinGroup: "குழுவில் சேரவும்",
    groupName: "குழுவின் பெயர்",
    totalAmount: "மொத்த தொகை",
    monthlyContribution: "மாதாந்திர பங்களிப்பு",
    duration: "காலம் (மாதங்கள்)",
    maxMembers: "அதிகபட்ச உறுப்பினர்கள்",
    inviteCode: "அழைப்பு குறியீடு",
    makePrivate: "தனிப்பட்டதாக்கவும்",
    create: "உருவாக்கவும்",
    join: "சேரவும்",
    cancel: "ரத்து செய்",
    members: "உறுப்பினர்கள்",
    recruiting: "உறுப்பினர் சேர்க்கை",
    active: "செயலில்",
    completed: "முடிந்தது",
    contribute: "பங்களிக்கவும்",
    viewDetails: "விவரங்களைப் பார்க்கவும்",
    shareInvite: "அழைப்பைப் பகிரவும்",
    nextPayout: "அடுத்த பணம்",
    myContributions: "என் பங்களிப்புகள்",
    totalContributions: "மொத்த பங்களிப்புகள்",
    payoutReceived: "பணம் பெறப்பட்டது",
    pendingPayout: "நிலுவையில் உள்ள பணம்",
    trustScore: "நம்பிக்கை மதிப்பெண்",
    blockchainVerified: "பிளாக்செயின் சரிபார்க்கப்பட்டது",
    transparentLedger: "வெளிப்படையான கணக்கு",
    noGroups: "குழுக்கள் இல்லை",
    joinFirstGroup: "உங்கள் முதல் குழுவில் சேரவும்",
    congratulations: "வாழ்த்துக்கள்!",
    payoutSuccess: "பணம் வெற்றிகரமாக!",
    contractDeployed: "ஒப்பந்தம் பயன்படுத்தப்பட்டது",
  },
}

export function MittiCommit({ selectedLanguage, onBack }: MittiCommitProps) {
  const [chitFunds, setChitFunds] = useState<ChitFund[]>([
    {
      id: "1",
      name: "Family Savings Circle",
      totalAmount: 120000,
      monthlyContribution: 10000,
      duration: 12,
      currentMonth: 3,
      members: [
        {
          id: "1",
          name: "Priya Sharma",
          walletAddress: "0x1234...5678",
          contributionsPaid: 3,
          hasReceivedPayout: false,
          joinedAt: new Date(),
        },
        {
          id: "2",
          name: "Rahul Kumar",
          walletAddress: "0x2345...6789",
          contributionsPaid: 3,
          hasReceivedPayout: true,
          payoutMonth: 2,
          joinedAt: new Date(),
        },
        {
          id: "3",
          name: "Anita Patel",
          walletAddress: "0x3456...7890",
          contributionsPaid: 2,
          hasReceivedPayout: false,
          joinedAt: new Date(),
        },
      ],
      maxMembers: 12,
      status: "active",
      createdBy: "1",
      createdAt: new Date(),
      nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      contractAddress: "0xabcd...efgh",
      isPrivate: false,
    },
    {
      id: "2",
      name: "Business Growth Fund",
      totalAmount: 240000,
      monthlyContribution: 20000,
      duration: 12,
      currentMonth: 1,
      members: [
        {
          id: "1",
          name: "Priya Sharma",
          walletAddress: "0x1234...5678",
          contributionsPaid: 1,
          hasReceivedPayout: false,
          joinedAt: new Date(),
        },
      ],
      maxMembers: 12,
      status: "recruiting",
      createdBy: "1",
      createdAt: new Date(),
      nextPayoutDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isPrivate: true,
      inviteCode: "BG2024",
    },
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null)
  const [celebratingPayout, setCelebratingPayout] = useState<string | null>(null)
  const [newChitFund, setNewChitFund] = useState({
    name: "",
    totalAmount: "",
    monthlyContribution: "",
    duration: "",
    maxMembers: "",
    isPrivate: false,
    inviteCode: "",
  })
  const [joinCode, setJoinCode] = useState("")

  const texts = languageTexts[selectedLanguage as keyof typeof languageTexts] || languageTexts.en

  const createChitFund = async () => {
    if (newChitFund.name && newChitFund.totalAmount && newChitFund.monthlyContribution && newChitFund.duration) {
      // Simulate blockchain contract deployment
      const contractAddress = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`

      const chitFund: ChitFund = {
        id: Date.now().toString(),
        name: newChitFund.name,
        totalAmount: Number.parseFloat(newChitFund.totalAmount),
        monthlyContribution: Number.parseFloat(newChitFund.monthlyContribution),
        duration: Number.parseInt(newChitFund.duration),
        currentMonth: 0,
        members: [
          {
            id: "1",
            name: "You",
            walletAddress: "0x1234...5678",
            contributionsPaid: 0,
            hasReceivedPayout: false,
            joinedAt: new Date(),
          },
        ],
        maxMembers: Number.parseInt(newChitFund.maxMembers),
        status: "recruiting",
        createdBy: "1",
        createdAt: new Date(),
        nextPayoutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        contractAddress,
        isPrivate: newChitFund.isPrivate,
        inviteCode: newChitFund.isPrivate ? newChitFund.inviteCode : undefined,
      }

      setChitFunds([...chitFunds, chitFund])
      setNewChitFund({
        name: "",
        totalAmount: "",
        monthlyContribution: "",
        duration: "",
        maxMembers: "",
        isPrivate: false,
        inviteCode: "",
      })
      setShowCreateForm(false)

      // Show celebration for contract deployment
      setCelebratingPayout(chitFund.id)
      setTimeout(() => setCelebratingPayout(null), 3000)
    }
  }

  const joinChitFund = () => {
    // Simulate joining a chit fund with invite code
    if (joinCode) {
      const existingFund = chitFunds.find((fund) => fund.inviteCode === joinCode)
      if (existingFund && existingFund.members.length < existingFund.maxMembers) {
        const updatedFunds = chitFunds.map((fund) => {
          if (fund.id === existingFund.id) {
            return {
              ...fund,
              members: [
                ...fund.members,
                {
                  id: Date.now().toString(),
                  name: "You",
                  walletAddress: "0x1234...5678",
                  contributionsPaid: 0,
                  hasReceivedPayout: false,
                  joinedAt: new Date(),
                },
              ],
            }
          }
          return fund
        })
        setChitFunds(updatedFunds)
        setJoinCode("")
        setShowJoinForm(false)
      }
    }
  }

  const makeContribution = (chitFundId: string) => {
    setChitFunds(
      chitFunds.map((fund) => {
        if (fund.id === chitFundId) {
          const updatedMembers = fund.members.map((member) => {
            if (member.id === "1") {
              // Current user
              return {
                ...member,
                contributionsPaid: member.contributionsPaid + 1,
              }
            }
            return member
          })

          return {
            ...fund,
            members: updatedMembers,
          }
        }
        return fund
      }),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "recruiting":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressPercentage = (fund: ChitFund) => {
    return (fund.currentMonth / fund.duration) * 100
  }

  const getTotalContributions = (fund: ChitFund) => {
    return fund.members.reduce((sum, member) => sum + member.contributionsPaid * fund.monthlyContribution, 0)
  }

  const getUserContributions = (fund: ChitFund) => {
    const userMember = fund.members.find((member) => member.id === "1")
    return userMember ? userMember.contributionsPaid * fund.monthlyContribution : 0
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    // Show toast notification
  }

  const shareInvite = (fund: ChitFund) => {
    const shareText = `Join my MittiCommit group "${fund.name}"! Use invite code: ${fund.inviteCode}`
    if (navigator.share) {
      navigator.share({
        title: "MittiCommit Invitation",
        text: shareText,
      })
    } else {
      copyInviteCode(fund.inviteCode || "")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="outline">
            ← Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">{texts.title}</h1>
            <p className="text-muted-foreground">{texts.subtitle}</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowJoinForm(true)} variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              {texts.joinGroup}
            </Button>
            <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              {texts.createGroup}
            </Button>
          </div>
        </div>

        {/* Trust & Security Banner */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">{texts.blockchainVerified}</h3>
                  <p className="text-sm text-green-600">{texts.transparentLedger}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-xs text-green-600">{texts.trustScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="text-xs text-green-600">Secure</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chit Funds Grid */}
        {chitFunds.length === 0 ? (
          <Card className="border-2 border-border/50">
            <CardContent className="text-center py-16">
              <Users className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold text-primary mb-2">{texts.noGroups}</h3>
              <p className="text-muted-foreground mb-6">{texts.joinFirstGroup}</p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {texts.createGroup}
                </Button>
                <Button onClick={() => setShowJoinForm(true)} variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {texts.joinGroup}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chitFunds.map((fund, index) => {
              const progress = getProgressPercentage(fund)
              const totalContributions = getTotalContributions(fund)
              const userContributions = getUserContributions(fund)
              const userMember = fund.members.find((member) => member.id === "1")

              return (
                <motion.div
                  key={fund.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className="overflow-hidden border-2 border-border/50 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white shadow-lg">
                            <Users className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{fund.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(fund.status)}>
                                {fund.status === "recruiting"
                                  ? texts.recruiting
                                  : fund.status === "active"
                                    ? texts.active
                                    : texts.completed}
                              </Badge>
                              {fund.isPrivate && (
                                <Badge variant="outline">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {fund.contractAddress && (
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span>Verified</span>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {fund.contractAddress.slice(0, 6)}...{fund.contractAddress.slice(-4)}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Progress */}
                      {fund.status === "active" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">
                              Month {fund.currentMonth}/{fund.duration}
                            </span>
                          </div>
                          <Progress value={progress} className="h-3" />
                        </div>
                      )}

                      {/* Fund Details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Monthly Contribution:</span>
                          <div className="flex items-center space-x-1">
                            <IndianRupee className="w-4 h-4" />
                            <span className="font-semibold">{fund.monthlyContribution.toLocaleString("en-IN")}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Pool:</span>
                          <div className="flex items-center space-x-1">
                            <IndianRupee className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-primary">
                              {fund.totalAmount.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{texts.members}:</span>
                          <span className="font-semibold">
                            {fund.members.length}/{fund.maxMembers}
                          </span>
                        </div>

                        {userMember && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{texts.myContributions}:</span>
                            <div className="flex items-center space-x-1">
                              <IndianRupee className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-green-600">
                                {userContributions.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        )}

                        {fund.status === "active" && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{texts.nextPayout}:</span>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span className="font-semibold text-sm">
                                {fund.nextPayoutDate.toLocaleDateString("en-IN")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        {fund.status === "active" && userMember && (
                          <Button onClick={() => makeContribution(fund.id)} className="flex-1" size="sm">
                            <Coins className="w-4 h-4 mr-2" />
                            {texts.contribute}
                          </Button>
                        )}
                        <Button
                          onClick={() => setShowDetailsModal(fund.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {texts.viewDetails}
                        </Button>
                        {fund.isPrivate && fund.inviteCode && (
                          <Button onClick={() => shareInvite(fund)} variant="outline" size="sm">
                            <Share className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Celebration Animation */}
                  <AnimatePresence>
                    {celebratingPayout === fund.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 bg-gradient-to-br from-blue-400/90 to-purple-500/90 rounded-lg flex items-center justify-center text-white text-center p-6"
                      >
                        <div className="space-y-3">
                          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: 2 }}>
                            <Shield className="w-16 h-16 mx-auto" />
                          </motion.div>
                          <div>
                            <h3 className="text-xl font-bold">{texts.congratulations}</h3>
                            <p className="text-sm">{texts.contractDeployed}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Create Chit Fund Modal */}
        <AnimatePresence>
          {showCreateForm && (
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
                <h3 className="text-xl font-bold text-center">{texts.createGroup}</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{texts.groupName}</label>
                    <Input
                      value={newChitFund.name}
                      onChange={(e) => setNewChitFund({ ...newChitFund, name: e.target.value })}
                      placeholder="Family Savings Circle"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{texts.totalAmount}</label>
                    <Input
                      type="number"
                      value={newChitFund.totalAmount}
                      onChange={(e) => setNewChitFund({ ...newChitFund, totalAmount: e.target.value })}
                      placeholder="120000"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{texts.monthlyContribution}</label>
                    <Input
                      type="number"
                      value={newChitFund.monthlyContribution}
                      onChange={(e) => setNewChitFund({ ...newChitFund, monthlyContribution: e.target.value })}
                      placeholder="10000"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{texts.duration}</label>
                    <Input
                      type="number"
                      value={newChitFund.duration}
                      onChange={(e) => setNewChitFund({ ...newChitFund, duration: e.target.value })}
                      placeholder="12"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{texts.maxMembers}</label>
                    <Input
                      type="number"
                      value={newChitFund.maxMembers}
                      onChange={(e) => setNewChitFund({ ...newChitFund, maxMembers: e.target.value })}
                      placeholder="12"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="private"
                      checked={newChitFund.isPrivate}
                      onChange={(e) => setNewChitFund({ ...newChitFund, isPrivate: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="private" className="text-sm font-medium">
                      {texts.makePrivate}
                    </label>
                  </div>

                  {newChitFund.isPrivate && (
                    <div>
                      <label className="text-sm font-medium">{texts.inviteCode}</label>
                      <Input
                        value={newChitFund.inviteCode}
                        onChange={(e) => setNewChitFund({ ...newChitFund, inviteCode: e.target.value })}
                        placeholder="FAMILY2024"
                      />
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={createChitFund} className="flex-1">
                    <Shield className="w-4 h-4 mr-2" />
                    {texts.create}
                  </Button>
                  <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                    {texts.cancel}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Join Chit Fund Modal */}
        <AnimatePresence>
          {showJoinForm && (
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
                <h3 className="text-xl font-bold text-center">{texts.joinGroup}</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{texts.inviteCode}</label>
                    <Input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="Enter invite code"
                      className="text-center text-lg tracking-wider"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={joinChitFund} className="flex-1">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {texts.join}
                  </Button>
                  <Button onClick={() => setShowJoinForm(false)} variant="outline" className="flex-1">
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
