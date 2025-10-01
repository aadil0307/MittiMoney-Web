'use client';

/**
 * Phone Authentication Component for MittiMoney
 * Handles phone number login with OTP verification
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';

interface PhoneLoginProps {
  onLoginSuccess?: () => void;
  language?: 'hi' | 'mr' | 'ta' | 'en';
}

const translations = {
  hi: {
    title: 'MittiMoney में आपका स्वागत है',
    subtitle: 'अपना मोबाइल नंबर दर्ज करें',
    phoneLabel: 'मोबाइल नंबर',
    phonePlaceholder: '9876543210',
    sendOTP: 'OTP भेजें',
    otpTitle: 'OTP दर्ज करें',
    otpSubtitle: 'आपके फोन पर भेजा गया 6 अंकों का कोड',
    otpPlaceholder: '123456',
    verify: 'सत्यापित करें',
    resendOTP: 'OTP फिर से भेजें',
    sending: 'भेजा जा रहा है...',
    verifying: 'सत्यापित किया जा रहा है...',
    success: 'सफलतापूर्वक लॉगिन!',
    changeNumber: 'नंबर बदलें',
  },
  mr: {
    title: 'MittiMoney मध्ये आपले स्वागत आहे',
    subtitle: 'तुमचा मोबाईल नंबर टाका',
    phoneLabel: 'मोबाईल नंबर',
    phonePlaceholder: '9876543210',
    sendOTP: 'OTP पाठवा',
    otpTitle: 'OTP प्रविष्ट करा',
    otpSubtitle: 'तुमच्या फोनवर पाठवलेला 6 अंकी कोड',
    otpPlaceholder: '123456',
    verify: 'सत्यापित करा',
    resendOTP: 'OTP पुन्हा पाठवा',
    sending: 'पाठवत आहे...',
    verifying: 'सत्यापित करत आहे...',
    success: 'यशस्वीरित्या लॉगिन!',
    changeNumber: 'नंबर बदला',
  },
  ta: {
    title: 'MittiMoney க்கு வரவேற்கிறோம்',
    subtitle: 'உங்கள் மொபைல் எண்ணை உள்ளிடவும்',
    phoneLabel: 'மொபைல் எண்',
    phonePlaceholder: '9876543210',
    sendOTP: 'OTP அனுப்பு',
    otpTitle: 'OTP ஐ உள்ளிடவும்',
    otpSubtitle: 'உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட 6 இலக்க குறியீடு',
    otpPlaceholder: '123456',
    verify: 'சரிபார்க்கவும்',
    resendOTP: 'OTP ஐ மீண்டும் அனுப்பு',
    sending: 'அனுப்புகிறது...',
    verifying: 'சரிபார்க்கிறது...',
    success: 'வெற்றிகரமாக உள்நுழைந்தது!',
    changeNumber: 'எண்ணை மாற்று',
  },
  en: {
    title: 'Welcome to MittiMoney',
    subtitle: 'Enter your mobile number',
    phoneLabel: 'Mobile Number',
    phonePlaceholder: '9876543210',
    sendOTP: 'Send OTP',
    otpTitle: 'Enter OTP',
    otpSubtitle: '6-digit code sent to your phone',
    otpPlaceholder: '123456',
    verify: 'Verify',
    resendOTP: 'Resend OTP',
    sending: 'Sending...',
    verifying: 'Verifying...',
    success: 'Login Successful!',
    changeNumber: 'Change Number',
  },
};

export function PhoneLogin({ onLoginSuccess, language = 'hi' }: PhoneLoginProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { sendOTP, verifyOTP, error, clearError } = useAuth();
  
  const t = translations[language];

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      return;
    }

    setLoading(true);
    clearError();

    try {
      const result = await sendOTP(phoneNumber);
      if (result.success) {
        setStep('otp');
        console.log('[PhoneLogin] OTP sent successfully via Twilio');
      } else {
        throw new Error(result.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('[PhoneLogin] Error sending OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      return;
    }

    setLoading(true);
    clearError();

    try {
      await verifyOTP(phoneNumber, otp);
      setStep('success');
      console.log('[PhoneLogin] OTP verified successfully');
      
      // Call success callback after a short delay
      setTimeout(() => {
        onLoginSuccess?.();
      }, 1500);
    } catch (error) {
      console.error('[PhoneLogin] Error verifying OTP:', error);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setStep('phone');
  };

  const handleChangeNumber = () => {
    setPhoneNumber('');
    setOtp('');
    setStep('phone');
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'phone' && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md relative z-10"
          >
            <Card className="shadow-2xl border-0">
              <CardHeader className="text-center space-y-2 pb-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t.title}
                </CardTitle>
                <CardDescription className="text-base">{t.subtitle}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t.phoneLabel}</label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center px-3 border rounded-md bg-muted">
                        <span className="text-sm font-medium">+91</span>
                      </div>
                      <Input
                        type="tel"
                        placeholder={t.phonePlaceholder}
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 10) {
                            setPhoneNumber(value);
                          }
                        }}
                        className="flex-1 text-lg"
                        disabled={loading}
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={loading || phoneNumber.length !== 10}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t.sending}
                      </>
                    ) : (
                      <>
                        {t.sendOTP}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md relative z-10"
          >
            <Card className="shadow-2xl border-0">
              <CardHeader className="text-center space-y-2 pb-4">
                <CardTitle className="text-2xl font-bold">{t.otpTitle}</CardTitle>
                <CardDescription>
                  {t.otpSubtitle}
                  <br />
                  <span className="font-semibold text-foreground">+91 {phoneNumber}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder={t.otpPlaceholder}
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 6) {
                          setOtp(value);
                        }
                      }}
                      className="text-center text-2xl tracking-widest font-bold"
                      disabled={loading}
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t.verifying}
                      </>
                    ) : (
                      <>
                        {t.verify}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="flex justify-between text-sm">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOTP}
                      disabled={loading}
                    >
                      {t.resendOTP}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleChangeNumber}
                      disabled={loading}
                    >
                      {t.changeNumber}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-full max-w-md relative z-10"
          >
            <Card className="shadow-2xl border-0">
              <CardContent className="pt-12 pb-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">{t.success}</h2>
                <p className="text-muted-foreground">Redirecting to dashboard...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
