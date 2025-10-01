"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Target,
  X,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react"

interface Notification {
  id: string
  type: "bill" | "savings" | "expense" | "achievement" | "reminder"
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  priority: "low" | "medium" | "high"
  actionRequired?: boolean
}

interface NotificationCenterProps {
  language: string
  isOpen: boolean
  onClose: () => void
}

const translations = {
  hindi: {
    title: "सूचनाएं",
    markAllRead: "सभी को पढ़ा हुआ चिह्नित करें",
    clearAll: "सभी साफ़ करें",
    settings: "सेटिंग्स",
    noNotifications: "कोई सूचना नहीं",
    billReminders: "बिल रिमाइंडर",
    savingsAlerts: "बचत अलर्ट",
    expenseWarnings: "खर्च चेतावनी",
    achievements: "उपलब्धियां",
    soundEnabled: "ध्वनि सक्षम",
    pushNotifications: "पुश नोटिफिकेशन",
    emailNotifications: "ईमेल नोटिफिकेशन",
    high: "उच्च",
    medium: "मध्यम",
    low: "कम",
  },
  english: {
    title: "Notifications",
    markAllRead: "Mark All Read",
    clearAll: "Clear All",
    settings: "Settings",
    noNotifications: "No notifications",
    billReminders: "Bill Reminders",
    savingsAlerts: "Savings Alerts",
    expenseWarnings: "Expense Warnings",
    achievements: "Achievements",
    soundEnabled: "Sound Enabled",
    pushNotifications: "Push Notifications",
    emailNotifications: "Email Notifications",
    high: "High",
    medium: "Medium",
    low: "Low",
  },
}

export function NotificationCenter({ language, isOpen, onClose }: NotificationCenterProps) {
  const t = translations[language as keyof typeof translations] || translations.english
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    soundEnabled: true,
    pushNotifications: true,
    emailNotifications: false,
    billReminders: true,
    savingsAlerts: true,
    expenseWarnings: true,
    achievements: true,
  })

  // Mock notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "bill",
        title: "Electricity Bill Due",
        message: "Your electricity bill of ₹2,500 is due in 2 days",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        isRead: false,
        priority: "high",
        actionRequired: true,
      },
      {
        id: "2",
        type: "savings",
        title: "Savings Goal Achieved!",
        message: "Congratulations! You've reached your vacation savings goal of ₹50,000",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: false,
        priority: "medium",
      },
      {
        id: "3",
        type: "expense",
        title: "Budget Alert",
        message: "You've spent 80% of your monthly food budget",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        isRead: true,
        priority: "medium",
      },
      {
        id: "4",
        type: "achievement",
        title: "Streak Milestone!",
        message: "You've logged expenses for 30 consecutive days!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: false,
        priority: "low",
      },
    ]
    setNotifications(mockNotifications)
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass =
      priority === "high"
        ? "text-destructive"
        : priority === "medium"
          ? "text-accent-foreground"
          : "text-muted-foreground"

    switch (type) {
      case "bill":
        return <AlertTriangle className={`w-5 h-5 ${iconClass}`} />
      case "savings":
        return <Target className={`w-5 h-5 ${iconClass}`} />
      case "expense":
        return <TrendingUp className={`w-5 h-5 ${iconClass}`} />
      case "achievement":
        return <CheckCircle className={`w-5 h-5 ${iconClass}`} />
      default:
        return <Info className={`w-5 h-5 ${iconClass}`} />
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-4 top-4 bottom-4 w-96 z-50"
    >
      <Card className="h-full border-2 border-border/50 shadow-2xl">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-primary" />
              {t.title}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!showSettings && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={markAllAsRead}>
                {t.markAllRead}
              </Button>
              <Button size="sm" variant="outline" onClick={clearAll}>
                {t.clearAll}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0 h-full overflow-hidden">
          {showSettings ? (
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-foreground">{t.settings}</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {notificationSettings.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Label>{t.soundEnabled}</Label>
                  </div>
                  <Switch
                    checked={notificationSettings.soundEnabled}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, soundEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t.pushNotifications}</Label>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t.emailNotifications}</Label>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <hr className="border-border/50" />

                <div className="flex items-center justify-between">
                  <Label>{t.billReminders}</Label>
                  <Switch
                    checked={notificationSettings.billReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, billReminders: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t.savingsAlerts}</Label>
                  <Switch
                    checked={notificationSettings.savingsAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, savingsAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t.expenseWarnings}</Label>
                  <Switch
                    checked={notificationSettings.expenseWarnings}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, expenseWarnings: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t.achievements}</Label>
                  <Switch
                    checked={notificationSettings.achievements}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, achievements: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t.noNotifications}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <AnimatePresence>
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        className={`p-4 border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer ${
                          !notification.isRead ? "bg-accent/5" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getNotificationIcon(notification.type, notification.priority)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4
                                className={`text-sm font-medium ${
                                  !notification.isRead ? "text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    notification.priority === "high"
                                      ? "destructive"
                                      : notification.priority === "medium"
                                        ? "default"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {t[notification.priority as keyof typeof t]}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeNotification(notification.id)
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p
                              className={`text-xs ${
                                !notification.isRead ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                            {notification.actionRequired && (
                              <Button size="sm" className="mt-2 h-6 text-xs">
                                Take Action
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
