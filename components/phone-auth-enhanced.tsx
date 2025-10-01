'use client';

/**
 * Enhanced Phone Authentication Component
 * Supports: Registration (OTP + Password), Login (OTP or Password)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';

interface PhoneAuthEnhancedProps {
  onLoginSuccess?: () => void;
  language?: 'hi' | 'mr' | 'ta' | 'en';
}

type AuthFlow = 'check' | 'register-otp' | 'register-password' | 'login-method' | 'login-otp' | 'login-password' | 'success';

export function PhoneAuthEnhanced({ onLoginSuccess, language = 'en' }: PhoneAuthEnhancedProps) {
  const { sendOTP, verifyOTP } = useAuth();
  
  // State
  const [step, setStep] = useState<AuthFlow>('check');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [userHasPassword, setUserHasPassword] = useState(false);

  // Check if user exists
  const handleCheckUser = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : `+91${phoneNumber}`;

      const response = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhone }),
      });

      const data = await response.json();

      if (data.exists) {
        // Existing user - show login options
        setIsNewUser(false);
        setUserHasPassword(data.hasPassword);
        setStep('login-method');
      } else {
        // New user - start registration
        setIsNewUser(true);
        setStep('register-otp');
        // Auto-send OTP for registration
        await handleSendOTP();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to check user');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const formattedPhone = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : `+91${phoneNumber}`;

      const result = await sendOTP(formattedPhone);

      if (result.success) {
        if (isNewUser) {
          setStep('register-otp');
        } else {
          setStep('login-otp');
        }
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP (for registration)
  const handleVerifyRegistrationOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : `+91${phoneNumber}`;

      await verifyOTP(formattedPhone, otp);
      
      // OTP verified, now set password
      setStep('register-password');
    } catch (error: any) {
      setError(error.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  // Set password during registration
  const handleSetPassword = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : `+91${phoneNumber}`;

      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhone, password }),
      });

      const data = await response.json();

      if (data.success && data.customToken) {
        // Sign in with custom token
        const { signInWithCustomToken } = await import('firebase/auth');
        const { getAuthInstance } = await import('@/lib/firebase/config');
        const auth = getAuthInstance();
        
        if (auth) {
          await signInWithCustomToken(auth, data.customToken);
          setStep('success');
          setTimeout(() => onLoginSuccess?.(), 1500);
        }
      } else {
        setError(data.error || 'Failed to set password');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  // Login with OTP
  const handleLoginWithOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : `+91${phoneNumber}`;

      await verifyOTP(formattedPhone, otp);
      setStep('success');
      setTimeout(() => onLoginSuccess?.(), 1500);
    } catch (error: any) {
      setError(error.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  // Login with password
  const handleLoginWithPassword = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : `+91${phoneNumber}`;

      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhone, password }),
      });

      const data = await response.json();

      if (data.success && data.customToken) {
        // Sign in with custom token
        const { signInWithCustomToken } = await import('firebase/auth');
        const { getAuthInstance } = await import('@/lib/firebase/config');
        const auth = getAuthInstance();
        
        if (auth) {
          await signInWithCustomToken(auth, data.customToken);
          setStep('success');
          setTimeout(() => onLoginSuccess?.(), 1500);
        }
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'check' && 'Welcome to MittiMoney'}
              {step === 'register-otp' && 'Verify Your Number'}
              {step === 'register-password' && 'Set Your Password'}
              {step === 'login-method' && 'Welcome Back!'}
              {step === 'login-otp' && 'Enter OTP'}
              {step === 'login-password' && 'Enter Password'}
              {step === 'success' && 'Success!'}
            </CardTitle>
            <CardDescription>
              {step === 'check' && 'Enter your mobile number to continue'}
              {step === 'register-otp' && 'We sent a 6-digit code to your phone'}
              {step === 'register-password' && 'Create a password for future logins'}
              {step === 'login-method' && 'Choose your login method'}
              {step === 'login-otp' && 'Enter the OTP sent to your phone'}
              {step === 'login-password' && 'Enter your password to login'}
              {step === 'success' && 'Logging you in...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence mode="wait">
              {/* Step 1: Check User */}
              {step === 'check' && (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 border rounded-lg bg-muted">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>+91</span>
                      </div>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleCheckUser}
                    disabled={loading || phoneNumber.length < 10}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                    Continue
                  </Button>
                </motion.div>
              )}

              {/* Step 2a: Register - Verify OTP */}
              {step === 'register-otp' && (
                <motion.div
                  key="register-otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter OTP</label>
                    <Input
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleVerifyRegistrationOTP}
                    disabled={loading || otp.length !== 6}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Verify OTP
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="w-full"
                  >
                    Resend OTP
                  </Button>
                </motion.div>
              )}

              {/* Step 2b: Register - Set Password */}
              {step === 'register-password' && (
                <motion.div
                  key="register-password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Create Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm Password</label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleSetPassword}
                    disabled={loading || !password || !confirmPassword}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Complete Registration
                  </Button>
                </motion.div>
              )}

              {/* Step 3: Login Method Selection */}
              {step === 'login-method' && (
                <motion.div
                  key="login-method"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Tabs defaultValue={userHasPassword ? 'password' : 'otp'} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      {userHasPassword && (
                        <TabsTrigger value="password">Password</TabsTrigger>
                      )}
                      <TabsTrigger value="otp">OTP</TabsTrigger>
                    </TabsList>

                    {userHasPassword && (
                      <TabsContent value="password" className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Password</label>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <Button
                          onClick={handleLoginWithPassword}
                          disabled={loading || !password}
                          className="w-full"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                          Login with Password
                        </Button>
                      </TabsContent>
                    )}

                    <TabsContent value="otp" className="space-y-4">
                      <Button
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Phone className="w-4 h-4 mr-2" />}
                        Send OTP
                      </Button>
                    </TabsContent>
                  </Tabs>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStep('check');
                      setPhoneNumber('');
                      setPassword('');
                      setError('');
                    }}
                    className="w-full"
                  >
                    Change Number
                  </Button>
                </motion.div>
              )}

              {/* Step 4: Login with OTP */}
              {step === 'login-otp' && (
                <motion.div
                  key="login-otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter OTP</label>
                    <Input
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleLoginWithOTP}
                    disabled={loading || otp.length !== 6}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Verify & Login
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setStep('login-method')}
                    disabled={loading}
                    className="w-full"
                  >
                    Back
                  </Button>
                </motion.div>
              )}

              {/* Success Screen */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <motion.div
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      ✓
                    </motion.div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">Login Successful!</h3>
                  <p className="text-muted-foreground">Redirecting...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
