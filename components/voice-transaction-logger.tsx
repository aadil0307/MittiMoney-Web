"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, Check, X, Loader2, IndianRupee } from "lucide-react"
import { useOffline } from "./offline-manager"
import { useOfflineStorage } from "@/hooks/use-local-storage"

interface Transaction {
  id: string
  amount: number
  category: string
  description: string
  type: "income" | "expense"
  timestamp: Date
  confidence: number
}

interface VoiceTransactionLoggerProps {
  onTransactionAdded: (transaction: Transaction) => void
  selectedLanguage: string
}

const categoryMappings = {
  // Hindi
  खाना: "food",
  भोजन: "food",
  खरीदारी: "shopping",
  यात्रा: "transport",
  दवा: "medical",
  बिजली: "utilities",
  किराया: "rent",
  वेतन: "salary",
  आय: "income",

  // English
  food: "food",
  shopping: "shopping",
  transport: "transport",
  medical: "medical",
  utilities: "utilities",
  rent: "rent",
  salary: "salary",
  income: "income",

  // Marathi
  जेवण: "food",
  खरेदी: "shopping",
  प्रवास: "transport",
  औषध: "medical",
  वीज: "utilities",
  भाडे: "rent",
  पगार: "salary",

  // Tamil
  உணவு: "food",
  வாங்குதல்: "shopping",
  பயணம்: "transport",
  மருந்து: "medical",
  மின்சாரம்: "utilities",
  வாடகை: "rent",
  சம்பளம்: "salary",
}

const languageTexts = {
  hi: {
    title: "आवाज़ से लेन-देन दर्ज करें",
    startListening: "बोलना शुरू करें",
    stopListening: "रुकें",
    listening: "सुन रहे हैं...",
    processing: "समझ रहे हैं...",
    confirm: "पुष्टि करें",
    cancel: "रद्द करें",
    tryAgain: "फिर कोशिश करें",
    example: "उदाहरण: 'मैंने खाने पर 150 रुपये खर्च किए'",
    detected: "पहचाना गया:",
    amount: "राशि",
    category: "श्रेणी",
    type: "प्रकार",
    income: "आय",
    expense: "खर्च",
  },
  en: {
    title: "Voice Transaction Logger",
    startListening: "Start Speaking",
    stopListening: "Stop",
    listening: "Listening...",
    processing: "Processing...",
    confirm: "Confirm",
    cancel: "Cancel",
    tryAgain: "Try Again",
    example: "Example: 'I spent 150 rupees on food'",
    detected: "Detected:",
    amount: "Amount",
    category: "Category",
    type: "Type",
    income: "Income",
    expense: "Expense",
  },
  mr: {
    title: "आवाजाने व्यवहार नोंदवा",
    startListening: "बोलायला सुरुवात करा",
    stopListening: "थांबा",
    listening: "ऐकत आहे...",
    processing: "समजत आहे...",
    confirm: "पुष्टी करा",
    cancel: "रद्द करा",
    tryAgain: "पुन्हा प्रयत्न करा",
    example: "उदाहरण: 'मी जेवणावर 150 रुपये खर्च केले'",
    detected: "ओळखले:",
    amount: "रक्कम",
    category: "प्रकार",
    type: "प्रकार",
    income: "उत्पन्न",
    expense: "खर्च",
  },
  ta: {
    title: "குரல் பரிவர்த்தனை பதிவு",
    startListening: "பேசத் தொடங்குங்கள்",
    stopListening: "நிறுத்து",
    listening: "கேட்கிறது...",
    processing: "செயலாக்கம்...",
    confirm: "உறுதிப்படுத்து",
    cancel: "ரத்து செய்",
    tryAgain: "மீண்டும் முயற்சி",
    example: "உதாரணம்: 'நான் உணவுக்கு 150 ரூபாய் செலவு செய்தேன்'",
    detected: "கண்டறியப்பட்டது:",
    amount: "தொகை",
    category: "வகை",
    type: "வகை",
    income: "வருமானம்",
    expense: "செலவு",
  },
}

export function VoiceTransactionLogger({ onTransactionAdded, selectedLanguage }: VoiceTransactionLoggerProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [parsedTransaction, setParsedTransaction] = useState<Partial<Transaction> | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const recognitionRef = useRef<any>(null)

  const { isOnline, addPendingTransaction } = useOffline()
  const { transactions, setTransactions } = useOfflineStorage()

  const texts = languageTexts[selectedLanguage as keyof typeof languageTexts] || languageTexts.en

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang =
        selectedLanguage === "hi"
          ? "hi-IN"
          : selectedLanguage === "mr"
            ? "mr-IN"
            : selectedLanguage === "ta"
              ? "ta-IN"
              : "en-IN"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        setIsListening(false)
        setIsProcessing(true)
        processTranscript(transcript)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
        setIsProcessing(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [selectedLanguage])

  const processTranscript = async (text: string) => {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simple NLP processing for demo
    const amount = extractAmount(text)
    const category = extractCategory(text)
    const type = extractType(text)

    if (amount && category) {
      const transaction: Partial<Transaction> = {
        id: Date.now().toString(),
        amount,
        category,
        description: text,
        type: type || "expense",
        timestamp: new Date(),
        confidence: 0.85,
      }

      setParsedTransaction(transaction)
      setShowConfirmation(true)
    }

    setIsProcessing(false)
  }

  const extractAmount = (text: string): number | null => {
    const amountRegex = /(\d+(?:\.\d+)?)\s*(?:रुपये|रुपया|rupees?|rs\.?)/i
    const match = text.match(amountRegex)
    return match ? Number.parseFloat(match[1]) : null
  }

  const extractCategory = (text: string): string => {
    const lowerText = text.toLowerCase()
    for (const [key, value] of Object.entries(categoryMappings)) {
      if (lowerText.includes(key.toLowerCase())) {
        return value
      }
    }
    return "other"
  }

  const extractType = (text: string): "income" | "expense" => {
    const incomeKeywords = [
      "earned",
      "received",
      "salary",
      "income",
      "कमाया",
      "मिला",
      "वेतन",
      "आय",
      "कमावले",
      "मिळाले",
      "पगार",
      "சம்பளம்",
      "வருமானம்",
    ]
    const expenseKeywords = [
      "spent",
      "paid",
      "bought",
      "खर्च",
      "दिया",
      "खरीदा",
      "खर्च केले",
      "दिले",
      "विकत घेतले",
      "செலவு",
      "கொடுத்தேன்",
      "வாங்கினேன்",
    ]

    const lowerText = text.toLowerCase()

    if (incomeKeywords.some((keyword) => lowerText.includes(keyword))) {
      return "income"
    }
    if (expenseKeywords.some((keyword) => lowerText.includes(keyword))) {
      return "expense"
    }

    return "expense" // default
  }

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("")
      setParsedTransaction(null)
      setShowConfirmation(false)
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const confirmTransaction = () => {
    if (parsedTransaction) {
      const transaction = parsedTransaction as Transaction

      const updatedTransactions = [...transactions, transaction]
      setTransactions(updatedTransactions)

      if (!isOnline) {
        addPendingTransaction(transaction)
      }

      onTransactionAdded(transaction)
      setShowConfirmation(false)
      setParsedTransaction(null)
      setTranscript("")
    }
  }

  const cancelTransaction = () => {
    setShowConfirmation(false)
    setParsedTransaction(null)
    setTranscript("")
  }

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Volume2 className="w-6 h-6 text-accent" />
            <span>{texts.title}</span>
            {!isOnline && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                ऑफलाइन
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isOnline && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">आप ऑफलाइन हैं। आपके लेन-देन स्थानीय रूप से सहेजे जा रहे हैं।</p>
            </div>
          )}

          {/* Voice Input Button */}
          <div className="text-center space-y-4">
            <motion.div
              animate={{
                scale: isListening ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: isListening ? Number.POSITIVE_INFINITY : 0,
              }}
            >
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                size="lg"
                className={`w-24 h-24 rounded-full text-white shadow-lg ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600"
                    : isProcessing
                      ? "bg-muted"
                      : "bg-accent hover:bg-accent/90"
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
            </motion.div>

            <div className="space-y-2">
              <p className="text-lg font-semibold">
                {isProcessing ? texts.processing : isListening ? texts.listening : texts.startListening}
              </p>
              <p className="text-sm text-muted-foreground">{texts.example}</p>
            </div>
          </div>

          {/* Transcript Display */}
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-muted rounded-lg"
              >
                <p className="text-sm text-muted-foreground mb-2">You said:</p>
                <p className="text-foreground">{transcript}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transaction Confirmation */}
          <AnimatePresence>
            {showConfirmation && parsedTransaction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">{texts.detected}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{texts.amount}:</span>
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="w-4 h-4" />
                        <span className="text-xl font-bold">{parsedTransaction.amount?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{texts.category}:</span>
                      <Badge className={getCategoryColor(parsedTransaction.category || "other")}>
                        {parsedTransaction.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{texts.type}:</span>
                      <Badge variant={parsedTransaction.type === "income" ? "default" : "secondary"}>
                        {parsedTransaction.type === "income" ? texts.income : texts.expense}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-3">
                  <Button onClick={confirmTransaction} className="flex-1" size="lg">
                    <Check className="w-5 h-5 mr-2" />
                    {texts.confirm}
                  </Button>
                  <Button onClick={cancelTransaction} variant="outline" className="flex-1 bg-transparent" size="lg">
                    <X className="w-5 h-5 mr-2" />
                    {texts.cancel}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
