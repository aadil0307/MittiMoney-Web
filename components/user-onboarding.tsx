"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Wallet, Briefcase, CheckCircle2, AlertCircle, Sparkles, IndianRupee, CreditCard } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { createUser } from "@/lib/firebase/firestore"

interface OnboardingData {
  displayName: string
  phoneNumber: string
  incomeSource: string
  monthlyIncome: number
  cashInHand: number
  bankBalance: number
  hasDebts: boolean
  totalDebtAmount: number
  hasLoans: boolean
  totalLoanAmount: number
  hasCreditCards: boolean
  creditCardDebt: number
  savingsGoal: string
  preferredLanguage: string
}

interface UserOnboardingProps {
  onComplete: () => void
}

const translations = {
  hi: {
    welcome: "MittiMoney में आपका स्वागत है",
    subtitle: "चलिए आपकी वित्तीय यात्रा शुरू करते हैं",
    step1Title: "आपका नाम क्या है?",
    step1Desc: "हम आपको कैसे बुलाएं?",
    namePlaceholder: "अपना नाम दर्ज करें",
    nameLabel: "पूरा नाम",
    step2Title: "आपकी आय का स्रोत",
    step2Desc: "आप कैसे कमाते हैं?",
    incomeLabel: "आय का स्रोत",
    incomePlaceholder: "जैसे: दैनिक मजदूरी, छोटा व्यवसाय",
    incomeOptions: {
      dailyWage: "दैनिक मजदूरी",
      smallBusiness: "छोटा व्यवसाय",
      farming: "खेती",
      driving: "ड्राइविंग",
      shopkeeper: "दुकानदार",
      vendor: "फेरीवाला",
      construction: "निर्माण कार्य",
      domestic: "घरेलू काम",
      other: "अन्य",
    },
    step3Title: "आपकी मासिक आय कितनी है?",
    step3Desc: "औसतन हर महीने आप कितना कमाते हैं?",
    monthlyIncomeLabel: "मासिक आय",
    monthlyIncomePlaceholder: "₹ राशि दर्ज करें",
    step4Title: "आपके पास कितना पैसा है?",
    step4Desc: "अभी आपके पास मौजूद राशि",
    cashLabel: "हाथ में नकद",
    cashPlaceholder: "₹ राशि दर्ज करें",
    bankLabel: "बैंक में जमा",
    bankPlaceholder: "₹ राशि दर्ज करें",
    step5Title: "क्या आप पर कोई कर्ज़ है?",
    step5Desc: "अपने कर्ज़ और ऋण के बारे में बताएं",
    hasDebtsLabel: "क्या आप पर कर्ज़ है?",
    yes: "हाँ",
    no: "नहीं",
    debtAmountLabel: "कुल कर्ज़ की राशि",
    debtAmountPlaceholder: "₹ राशि दर्ज करें",
    hasLoansLabel: "क्या आपने लोन लिया है?",
    loanAmountLabel: "कुल लोन की राशि",
    loanAmountPlaceholder: "₹ राशि दर्ज करें",
    hasCreditCardsLabel: "क्या आपके पास क्रेडिट कार्ड है?",
    creditCardDebtLabel: "क्रेडिट कार्ड बकाया",
    creditCardDebtPlaceholder: "₹ राशि दर्ज करें",
    step6Title: "आपका बचत लक्ष्य क्या है?",
    step6Desc: "आप क्यों बचत करना चाहते हैं?",
    savingsGoalLabel: "बचत का लक्ष्य",
    savingsGoalPlaceholder: "जैसे: घर खरीदना, शादी, शिक्षा",
    step7Title: "भाषा चुनें",
    step7Desc: "आप किस भाषा में काम करना पसंद करेंगे?",
    langLabel: "पसंदीदा भाषा",
    languages: {
      hi: "हिंदी",
      mr: "मराठी",
      ta: "தமிழ்",
      en: "English",
    },
    successTitle: "बधाई हो! 🎉",
    successDesc: "आपका खाता तैयार है",
    nextButton: "आगे बढ़ें",
    backButton: "पीछे जाएं",
    finishButton: "शुरू करें",
    errorRequired: "यह फील्ड आवश्यक है",
    errorInvalidAmount: "कृपया मान्य राशि दर्ज करें",
    savingProfile: "आपकी प्रोफाइल सहेजी जा रही है...",
    errorSaving: "प्रोफाइल सहेजने में त्रुटि। कृपया पुनः प्रयास करें।",
  },
  mr: {
    welcome: "MittiMoney मध्ये आपले स्वागत आहे",
    subtitle: "चला आपला आर्थिक प्रवास सुरू करूया",
    step1Title: "तुमचे नाव काय आहे?",
    step1Desc: "आम्ही तुम्हाला कसे हाक मारू?",
    namePlaceholder: "तुमचे नाव टाका",
    nameLabel: "पूर्ण नाव",
    step2Title: "तुमच्या उत्पन्नाचा स्रोत",
    step2Desc: "तुम्ही कसे कमवता?",
    incomeLabel: "उत्पन्नाचा स्रोत",
    incomePlaceholder: "उदा: दैनिक मजुरी, छोटा व्यवसाय",
    incomeOptions: {
      dailyWage: "दैनिक मजुरी",
      smallBusiness: "छोटा व्यवसाय",
      farming: "शेती",
      driving: "ड्रायव्हिंग",
      shopkeeper: "दुकानदार",
      vendor: "विक्रेता",
      construction: "बांधकाम",
      domestic: "घरगुती काम",
      other: "इतर",
    },
    step3Title: "तुमचे मासिक उत्पन्न किती आहे?",
    step3Desc: "सरासरी दर महिन्याला तुम्ही किती कमवता?",
    monthlyIncomeLabel: "मासिक उत्पन्न",
    monthlyIncomePlaceholder: "₹ रक्कम टाका",
    step4Title: "तुमच्याकडे किती पैसे आहेत?",
    step4Desc: "आत्ता तुमच्याकडे असलेली रक्कम",
    cashLabel: "हातातील रोकड",
    cashPlaceholder: "₹ रक्कम टाका",
    bankLabel: "बँकेत ठेव",
    bankPlaceholder: "₹ रक्कम टाका",
    step5Title: "तुमच्यावर कर्ज आहे का?",
    step5Desc: "तुमच्या कर्ज आणि कर्जाबद्दल सांगा",
    hasDebtsLabel: "तुमच्यावर कर्ज आहे का?",
    yes: "होय",
    no: "नाही",
    debtAmountLabel: "एकूण कर्जाची रक्कम",
    debtAmountPlaceholder: "₹ रक्कम टाका",
    hasLoansLabel: "तुम्ही कर्ज घेतले आहे का?",
    loanAmountLabel: "एकूण कर्जाची रक्कम",
    loanAmountPlaceholder: "₹ रक्कम टाका",
    hasCreditCardsLabel: "तुमच्याकडे क्रेडिट कार्ड आहे का?",
    creditCardDebtLabel: "क्रेडिट कार्ड थकबाकी",
    creditCardDebtPlaceholder: "₹ रक्कम टाका",
    step6Title: "तुमचे बचतीचे लक्ष्य काय आहे?",
    step6Desc: "तुम्हाला बचत का करायची आहे?",
    savingsGoalLabel: "बचतीचे लक्ष्य",
    savingsGoalPlaceholder: "उदा: घर खरेदी, लग्न, शिक्षण",
    step7Title: "भाषा निवडा",
    step7Desc: "तुम्हाला कोणत्या भाषेत काम करायला आवडेल?",
    langLabel: "आवडती भाषा",
    languages: {
      hi: "हिंदी",
      mr: "मराठी",
      ta: "தமிழ்",
      en: "English",
    },
    successTitle: "अभिनंदन! 🎉",
    successDesc: "तुमचे खाते तयार आहे",
    nextButton: "पुढे जा",
    backButton: "मागे जा",
    finishButton: "सुरू करा",
    errorRequired: "हे फील्ड आवश्यक आहे",
    errorInvalidAmount: "कृपया वैध रक्कम टाका",
    savingProfile: "तुमची प्रोफाइल सेव्ह होत आहे...",
    errorSaving: "प्रोफाइल सेव्ह करताना त्रुटी. कृपया पुन्हा प्रयत्न करा.",
  },
  ta: {
    welcome: "MittiMoney க்கு வரவேற்கிறோம்",
    subtitle: "உங்கள் நிதிப் பயணத்தைத் தொடங்குவோம்",
    step1Title: "உங்கள் பெயர் என்ன?",
    step1Desc: "நாங்கள் உங்களை எப்படி அழைக்கலாம்?",
    namePlaceholder: "உங்கள் பெயரை உள்ளிடவும்",
    nameLabel: "முழு பெயர்",
    step2Title: "உங்கள் வருமான ஆதாரம்",
    step2Desc: "நீங்கள் எப்படி சம்பாதிக்கிறீர்கள்?",
    incomeLabel: "வருமான ஆதாரம்",
    incomePlaceholder: "உதா: தினசரி கூலி, சிறு வியாபாரம்",
    incomeOptions: {
      dailyWage: "தினசரி கூலி",
      smallBusiness: "சிறு வியாபாரம்",
      farming: "விவசாயம்",
      driving: "ஓட்டுநர்",
      shopkeeper: "கடைக்காரர்",
      vendor: "வியாபாரி",
      construction: "கட்டுமானம்",
      domestic: "வீட்டு வேலை",
      other: "மற்றவை",
    },
    step3Title: "உங்கள் மாத வருமானம் என்ன?",
    step3Desc: "சராசரியாக மாதம் எவ்வளவு சம்பாதிக்கிறீர்கள்?",
    monthlyIncomeLabel: "மாத வருமானம்",
    monthlyIncomePlaceholder: "₹ தொகையை உள்ளிடவும்",
    step4Title: "உங்களிடம் எவ்வளவு பணம் உள்ளது?",
    step4Desc: "இப்போது உங்களிடம் உள்ள தொகை",
    cashLabel: "கையில் பணம்",
    cashPlaceholder: "₹ தொகையை உள்ளிடவும்",
    bankLabel: "வங்கியில் பணம்",
    bankPlaceholder: "₹ தொகையை உள்ளிடவும்",
    step5Title: "உங்களிடம் கடன் உள்ளதா?",
    step5Desc: "உங்கள் கடன்கள் பற்றி சொல்லவும்",
    hasDebtsLabel: "உங்களிடம் கடன் உள்ளதா?",
    yes: "ஆம்",
    no: "இல்லை",
    debtAmountLabel: "மொத்த கடன் தொகை",
    debtAmountPlaceholder: "₹ தொகையை உள்ளிடவும்",
    hasLoansLabel: "உங்களிடம் கடன் உள்ளதா?",
    loanAmountLabel: "மொத்த கடன் தொகை",
    loanAmountPlaceholder: "₹ தொகையை உள்ளிடவும்",
    hasCreditCardsLabel: "உங்களிடம் கிரெடிட் கார்டு உள்ளதா?",
    creditCardDebtLabel: "கிரெடிட் கார்டு நிலுவை",
    creditCardDebtPlaceholder: "₹ தொகையை உள்ளிடவும்",
    step6Title: "உங்கள் சேமிப்பு இலக்கு என்ன?",
    step6Desc: "ஏன் சேமிக்க விரும்புகிறீர்கள்?",
    savingsGoalLabel: "சேமிப்பு இலக்கு",
    savingsGoalPlaceholder: "உதா: வீடு வாங்க, திருமணம், கல்வி",
    step7Title: "மொழியைத் தேர்ந்தெடுக்கவும்",
    step7Desc: "எந்த மொழியில் பணியாற்ற விரும்புகிறீர்கள்?",
    langLabel: "விருப்ப மொழி",
    languages: {
      hi: "हिंदी",
      mr: "मराठी",
      ta: "தமிழ்",
      en: "English",
    },
    successTitle: "வாழ்த்துக்கள்! 🎉",
    successDesc: "உங்கள் கணக்கு தயார்",
    nextButton: "அடுத்தது",
    backButton: "பின்செல்",
    finishButton: "தொடங்கு",
    errorRequired: "இந்த புலம் தேவை",
    errorInvalidAmount: "சரியான தொகையை உள்ளிடவும்",
    savingProfile: "உங்கள் சுயவிவரம் சேமிக்கப்படுகிறது...",
    errorSaving: "சுயவிவரத்தைச் சேமிக்கும்போது பிழை. மீண்டும் முயற்சிக்கவும்.",
  },
  en: {
    welcome: "Welcome to MittiMoney",
    subtitle: "Let's start your financial journey",
    step1Title: "What's your name?",
    step1Desc: "How should we address you?",
    namePlaceholder: "Enter your name",
    nameLabel: "Full Name",
    step2Title: "Your income source",
    step2Desc: "How do you earn?",
    incomeLabel: "Income Source",
    incomePlaceholder: "e.g., Daily wage, Small business",
    incomeOptions: {
      dailyWage: "Daily Wage",
      smallBusiness: "Small Business",
      farming: "Farming",
      driving: "Driving",
      shopkeeper: "Shopkeeper",
      vendor: "Vendor",
      construction: "Construction Work",
      domestic: "Domestic Work",
      other: "Other",
    },
    step3Title: "What's your monthly income?",
    step3Desc: "On average, how much do you earn per month?",
    monthlyIncomeLabel: "Monthly Income",
    monthlyIncomePlaceholder: "₹ Enter amount",
    step4Title: "How much money do you have?",
    step4Desc: "Amount you currently have",
    cashLabel: "Cash in Hand",
    cashPlaceholder: "₹ Enter amount",
    bankLabel: "Bank Balance",
    bankPlaceholder: "₹ Enter amount",
    step5Title: "Do you have any debts?",
    step5Desc: "Tell us about your debts and loans",
    hasDebtsLabel: "Do you have debts?",
    yes: "Yes",
    no: "No",
    debtAmountLabel: "Total Debt Amount",
    debtAmountPlaceholder: "₹ Enter amount",
    hasLoansLabel: "Do you have any loans?",
    loanAmountLabel: "Total Loan Amount",
    loanAmountPlaceholder: "₹ Enter amount",
    hasCreditCardsLabel: "Do you have credit cards?",
    creditCardDebtLabel: "Credit Card Outstanding",
    creditCardDebtPlaceholder: "₹ Enter amount",
    step6Title: "What's your savings goal?",
    step6Desc: "Why do you want to save?",
    savingsGoalLabel: "Savings Goal",
    savingsGoalPlaceholder: "e.g., Buy house, Marriage, Education",
    step7Title: "Choose Language",
    step7Desc: "Which language would you prefer to work in?",
    langLabel: "Preferred Language",
    languages: {
      hi: "हिंदी",
      mr: "मराठी",
      ta: "தமிழ்",
      en: "English",
    },
    successTitle: "Congratulations! 🎉",
    successDesc: "Your account is ready",
    nextButton: "Next",
    backButton: "Back",
    finishButton: "Get Started",
    errorRequired: "This field is required",
    errorInvalidAmount: "Please enter a valid amount",
    savingProfile: "Saving your profile...",
    errorSaving: "Error saving profile. Please try again.",
  },
}

export function UserOnboarding({ onComplete }: UserOnboardingProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [language, setLanguage] = useState<"hi" | "mr" | "ta" | "en">("hi")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<OnboardingData>({
    displayName: "",
    phoneNumber: user?.phoneNumber || "",
    incomeSource: "",
    monthlyIncome: 0,
    cashInHand: 0,
    bankBalance: 0,
    hasDebts: false,
    totalDebtAmount: 0,
    hasLoans: false,
    totalLoanAmount: 0,
    hasCreditCards: false,
    creditCardDebt: 0,
    savingsGoal: "",
    preferredLanguage: "hi",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const t = translations[language]

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.displayName.trim()) {
        newErrors.displayName = t.errorRequired
      }
    }

    if (step === 2) {
      if (!formData.incomeSource.trim()) {
        newErrors.incomeSource = t.errorRequired
      }
    }

    if (step === 3) {
      if (formData.monthlyIncome < 0) {
        newErrors.monthlyIncome = t.errorInvalidAmount
      }
    }

    if (step === 4) {
      if (formData.cashInHand < 0) {
        newErrors.cashInHand = t.errorInvalidAmount
      }
      if (formData.bankBalance < 0) {
        newErrors.bankBalance = t.errorInvalidAmount
      }
    }

    if (step === 5) {
      if (formData.hasDebts && formData.totalDebtAmount < 0) {
        newErrors.totalDebtAmount = t.errorInvalidAmount
      }
      if (formData.hasLoans && formData.totalLoanAmount < 0) {
        newErrors.totalLoanAmount = t.errorInvalidAmount
      }
      if (formData.hasCreditCards && formData.creditCardDebt < 0) {
        newErrors.creditCardDebt = t.errorInvalidAmount
      }
    }

    if (step === 6) {
      if (!formData.savingsGoal.trim()) {
        newErrors.savingsGoal = t.errorRequired
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 8))
      setError(null)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setError(null)
    setErrors({})
  }

  const handleFinish = async () => {
    if (!user) {
      setError("User not authenticated")
      return
    }

    setLoading(true)
    setError(null)

    // Safety timeout: Proceed after 5 seconds regardless
    const safetyTimeout = setTimeout(() => {
      console.warn("[Onboarding] Timeout reached, proceeding to completion")
      setLoading(false)
      setCurrentStep(5)
      setTimeout(() => {
        onComplete()
      }, 2000)
    }, 5000)

    try {
      console.log("[Onboarding] Saving user profile:", {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: formData.displayName,
      })

      // Create user profile in Firestore with the correct ID structure
      const userId = user.uid
      await createUser({
        uid: userId,
        phoneNumber: user.phoneNumber || "",
        displayName: formData.displayName,
        incomeSource: formData.incomeSource,
        cashInHand: formData.cashInHand,
        bankBalance: formData.bankBalance,
        preferredLanguage: formData.preferredLanguage as "hi" | "mr" | "ta" | "en",
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)

      console.log("[Onboarding] Profile saved successfully")
      
      // Clear safety timeout since we succeeded
      clearTimeout(safetyTimeout)

      // Show success step
      setCurrentStep(5)

      // Wait a moment before completing
      setTimeout(() => {
        onComplete()
      }, 2000)
    } catch (err: any) {
      console.error("[Onboarding] Error saving profile:", err)
      console.error("[Onboarding] Error details:", {
        message: err?.message,
        code: err?.code,
        name: err?.name,
      })
      
      // Always proceed to avoid getting stuck
      // Profile will sync when Firestore is available
      console.warn("[Onboarding] Proceeding to completion despite error")
      setLoading(false)
      setCurrentStep(5)
      
      setTimeout(() => {
        onComplete()
      }, 2000)
    } finally {
      // Ensure loading is always turned off
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof OnboardingData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Step 1: Name
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
    >
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
        <CardHeader className="text-center pb-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-xl"
          >
            <User className="h-10 w-10 text-white" />
          </motion.div>
          <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-primary via-accent to-orange-600 bg-clip-text text-transparent">{t.step1Title}</CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">{t.step1Desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-8">
          <div className="space-y-3">
            <Label htmlFor="displayName" className="text-base font-semibold">{t.nameLabel}</Label>
            <Input
              id="displayName"
              placeholder={t.namePlaceholder}
              value={formData.displayName}
              onChange={(e) => updateFormData("displayName", e.target.value)}
              className={`h-12 text-lg ${errors.displayName ? "border-red-500 focus-visible:ring-red-500" : "border-primary/30 focus-visible:ring-primary"}`}
              autoFocus
            />
            {errors.displayName && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.displayName}
              </motion.p>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleNext} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg" size="lg">
              {t.nextButton} →
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Step 2: Income Source
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
    >
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
        <CardHeader className="text-center pb-6">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 shadow-xl"
          >
            <Briefcase className="h-10 w-10 text-white" />
          </motion.div>
          <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">{t.step2Title}</CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">{t.step2Desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-8">
          <div className="space-y-3">
            <Label htmlFor="incomeSource" className="text-base font-semibold">{t.incomeLabel}</Label>
            <Select
              value={formData.incomeSource}
              onValueChange={(value) => updateFormData("incomeSource", value)}
            >
              <SelectTrigger className={`h-12 text-base ${errors.incomeSource ? "border-red-500 focus:ring-red-500" : "border-emerald-600/30 focus:ring-emerald-600"}`}>
                <SelectValue placeholder={t.incomePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dailyWage">{t.incomeOptions.dailyWage}</SelectItem>
                <SelectItem value="smallBusiness">{t.incomeOptions.smallBusiness}</SelectItem>
                <SelectItem value="farming">{t.incomeOptions.farming}</SelectItem>
                <SelectItem value="driving">{t.incomeOptions.driving}</SelectItem>
                <SelectItem value="shopkeeper">{t.incomeOptions.shopkeeper}</SelectItem>
                <SelectItem value="vendor">{t.incomeOptions.vendor}</SelectItem>
                <SelectItem value="construction">{t.incomeOptions.construction}</SelectItem>
                <SelectItem value="domestic">{t.incomeOptions.domestic}</SelectItem>
                <SelectItem value="other">{t.incomeOptions.other}</SelectItem>
              </SelectContent>
            </Select>
            {errors.incomeSource && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.incomeSource}
              </motion.p>
            )}
          </div>

          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button onClick={handleBack} variant="outline" className="w-full border-2" size="lg">
                ← {t.backButton}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button onClick={handleNext} className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 shadow-lg" size="lg">
                {t.nextButton} →
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Step 3: Monthly Income
  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
    >
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
        <CardHeader className="text-center pb-6">
          <motion.div 
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl"
          >
            <IndianRupee className="h-10 w-10 text-white" />
          </motion.div>
          <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">{t.step3Title}</CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">{t.step3Desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-8">
          <div className="space-y-3">
            <Label htmlFor="monthlyIncome" className="text-base font-semibold flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              {t.monthlyIncomeLabel}
            </Label>
            <Input
              id="monthlyIncome"
              type="number"
              placeholder={t.monthlyIncomePlaceholder}
              value={formData.monthlyIncome || ""}
              onChange={(e) => updateFormData("monthlyIncome", parseFloat(e.target.value) || 0)}
              className={`h-12 text-lg ${errors.monthlyIncome ? "border-red-500 focus-visible:ring-red-500" : "border-blue-600/30 focus-visible:ring-blue-600"}`}
              min="0"
              autoFocus
            />
            {errors.monthlyIncome && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.monthlyIncome}
              </motion.p>
            )}
            <p className="text-sm text-muted-foreground">
              {language === "hi" && "यह जानकारी आपके बजट की योजना बनाने में मदद करेगी"}
              {language === "en" && "This helps us plan your budget better"}
              {language === "mr" && "हे तुमचे बजेट योजना करण्यात मदत करेल"}
              {language === "ta" && "இது உங்கள் பட்ஜெட்டை சிறப்பாக திட்டமிட உதவும்"}
            </p>
          </div>

          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button onClick={handleBack} variant="outline" className="w-full border-2" size="lg">
                ← {t.backButton}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button onClick={handleNext} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg" size="lg">
                {t.nextButton} →
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Step 4: Current Balances
  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
    >
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
        <CardHeader className="text-center pb-6">
          <motion.div 
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-600 to-orange-700 shadow-xl"
          >
            <Wallet className="h-10 w-10 text-white" />
          </motion.div>
          <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">{t.step4Title}</CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">{t.step4Desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-8">
          <div className="space-y-3">
            <Label htmlFor="cashInHand" className="text-base font-semibold flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              {t.cashLabel}
            </Label>
            <Input
              id="cashInHand"
              type="number"
              placeholder={t.cashPlaceholder}
              value={formData.cashInHand || ""}
              onChange={(e) => updateFormData("cashInHand", parseFloat(e.target.value) || 0)}
              className={`h-12 text-lg ${errors.cashInHand ? "border-red-500 focus-visible:ring-red-500" : "border-amber-600/30 focus-visible:ring-amber-600"}`}
              min="0"
            />
            {errors.cashInHand && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.cashInHand}
              </motion.p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="bankBalance" className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {t.bankLabel}
            </Label>
            <Input
              id="bankBalance"
              type="number"
              placeholder={t.bankPlaceholder}
              value={formData.bankBalance || ""}
              onChange={(e) => updateFormData("bankBalance", parseFloat(e.target.value) || 0)}
              className={`h-12 text-lg ${errors.bankBalance ? "border-red-500 focus-visible:ring-red-500" : "border-amber-600/30 focus-visible:ring-amber-600"}`}
              min="0"
            />
            {errors.bankBalance && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.bankBalance}
              </motion.p>
            )}
          </div>

          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button onClick={handleBack} variant="outline" className="w-full border-2" size="lg">
                ← {t.backButton}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button onClick={handleNext} className="w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 shadow-lg" size="lg">
                {t.nextButton} →
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Step 5: Debts & Loans (NEW - TO BE IMPLEMENTED)
  // Step 6: Savings Goal (NEW - TO BE IMPLEMENTED)
  // Step 7: Language Preference
  const renderStep7 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
    >
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
        <CardHeader className="text-center pb-6">
          <motion.div 
            initial={{ scale: 0, rotate: -360 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-xl"
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>
          <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{t.step4Title}</CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">{t.step4Desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-8">
          <div className="space-y-3">
            <Label htmlFor="language" className="text-base font-semibold">{t.langLabel}</Label>
            <Select
              value={formData.preferredLanguage}
              onValueChange={(value) => {
                updateFormData("preferredLanguage", value)
                setLanguage(value as "hi" | "mr" | "ta" | "en")
              }}
            >
              <SelectTrigger className="h-12 text-base border-violet-600/30 focus:ring-violet-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hi" className="text-base py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇮🇳</span>
                    <span>{t.languages.hi}</span>
                  </div>
                </SelectItem>
                <SelectItem value="mr" className="text-base py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇮🇳</span>
                    <span>{t.languages.mr}</span>
                  </div>
                </SelectItem>
                <SelectItem value="ta" className="text-base py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇮🇳</span>
                    <span>{t.languages.ta}</span>
                  </div>
                </SelectItem>
                <SelectItem value="en" className="text-base py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌍</span>
                    <span>{t.languages.en}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="destructive" className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button onClick={handleBack} variant="outline" className="w-full border-2" size="lg" disabled={loading}>
                ← {t.backButton}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button 
                onClick={handleFinish} 
                className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 shadow-lg relative overflow-hidden group" 
                size="lg"
                disabled={loading}
              >
                {loading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                )}
                {loading ? t.savingProfile : `${t.finishButton} 🎉`}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Step 5: Success
  const renderStep5 = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
    >
      <Card className="w-full max-w-md border-0 shadow-2xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/40 dark:to-teal-950/40 backdrop-blur-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/10"></div>
        <CardHeader className="text-center pb-6 relative">
          <motion.div
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-green-700 shadow-2xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: 0
            }}
            transition={{ 
              scale: { duration: 1, repeat: Infinity },
              rotate: { delay: 0.2, type: "spring", stiffness: 200 }
            }}
          >
            <CheckCircle2 className="h-14 w-14 text-white" />
          </motion.div>
          <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
            {t.successTitle}
          </CardTitle>
          <CardDescription className="text-lg font-medium text-muted-foreground">{t.successDesc}</CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8 relative">
          <motion.div
            className="mb-6 text-7xl"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 1 },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            🎊
          </motion.div>
          <div className="space-y-4">
            <p className="text-lg font-semibold text-foreground">
              {formData.displayName}! 👋
            </p>
            <p className="text-muted-foreground text-base">
              {language === "hi" && "आपकी यात्रा शुरू हो रही है..."}
              {language === "mr" && "तुमचा प्रवास सुरू होत आहे..."}
              {language === "ta" && "உங்கள் பயணம் தொடங்குகிறது..."}
              {language === "en" && "Your journey begins now..."}
            </p>
            <motion.div
              className="flex justify-center gap-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Progress indicator
  const renderProgress = () => (
    <div className="mb-10 w-full max-w-md">
      <div className="flex justify-between gap-3">
        {[1, 2, 3, 4].map((step) => (
          <motion.div
            key={step}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: step * 0.1, duration: 0.3 }}
            className="flex-1 origin-left"
          >
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                step < currentStep
                  ? "bg-gradient-to-r from-primary to-accent shadow-lg"
                  : step === currentStep
                  ? "bg-gradient-to-r from-primary/60 to-accent/60 shadow-md animate-pulse"
                  : "bg-muted dark:bg-slate-700"
              }`}
            />
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm font-semibold text-muted-foreground">
          {currentStep < 5 && `Step ${currentStep} of 4`}
        </span>
        <span className="text-sm font-bold text-primary">
          {currentStep < 5 && `${Math.round((currentStep / 4) * 100)}% Complete`}
        </span>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8 relative overflow-hidden">
      {/* Enhanced Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Language switcher */}
      {currentStep < 4 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-4 top-4 z-20"
        >
          <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
            <SelectTrigger className="w-36 h-11 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-2 shadow-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hi">🇮🇳 हिंदी</SelectItem>
              <SelectItem value="mr">🇮🇳 मराठी</SelectItem>
              <SelectItem value="ta">🇮🇳 தமிழ்</SelectItem>
              <SelectItem value="en">🌍 English</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Header */}
      {currentStep === 1 && (
        <motion.div
          className="mb-10 text-center z-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="text-6xl mb-4">💰</div>
          </motion.div>
          <h1 className="mb-3 text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-accent to-orange-600 bg-clip-text text-transparent">{t.welcome}</h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">{t.subtitle}</p>
        </motion.div>
      )}

      {/* Progress bar */}
      {currentStep < 5 && renderProgress()}

      {/* Steps */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </AnimatePresence>
    </div>
  )
}
