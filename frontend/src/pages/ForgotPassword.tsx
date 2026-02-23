import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [countdown, setCountdown] = useState(0);
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotPasswordFormData>();

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendCode = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to send verification code
      console.log('Sending code to:', data.email);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('code');
      setCountdown(300); // 5 minutes countdown
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newCode = [...code];
        digits.forEach((digit, i) => {
          if (i < 6) newCode[i] = digit;
        });
        setCode(newCode);
        // Focus the last filled input or the last input
        const lastFilledIndex = Math.min(digits.length - 1, 5);
        inputRefs.current[lastFilledIndex]?.focus();
      });
    }
  };

  const handleCodeSubmit = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to verify code
      console.log('Verifying code:', verificationCode);
      const email = getValues('email');
      console.log('Email:', email);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // TODO: Navigate to reset password page
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (countdown > 0) return;
    
    const email = getValues('email');
    if (!email) {
      setStep('email');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to resend code
      console.log('Resending code to:', email);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(300); // Reset countdown to 5 minutes
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white/90 backdrop-blur-sm border border-indigo-200/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Forgot Password
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                {step === 'email' 
                  ? 'Enter your email to receive a verification code'
                  : 'Enter the 6-digit code sent to your email'
                }
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleSubmit(sendCode)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md"
                    placeholder="admin@hospital.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-4 text-center text-gray-700">
                    Enter Verification Code
                  </label>
                  <div className="flex justify-center gap-3">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        className="w-14 h-14 text-center text-2xl font-semibold border-2 border-indigo-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md"
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code?
                  </p>
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-600">
                      Resend code in <span className="font-semibold text-indigo-600 text-lg">{formatCountdown(countdown)}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={resendCode}
                      disabled={isLoading}
                      className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium disabled:opacity-50 transition-colors"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCodeSubmit}
                  disabled={isLoading || code.some(d => !d)}
                  className="w-full px-4 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Change Email
                  </button>
                  <div>
                    <Link
                      to="/login"
                      className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium transition-colors"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Hospital Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Hospital Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/95 via-purple-600/85 to-pink-600/90" />
        {/* Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E")`
          }}
        />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
          <div className="text-white space-y-6 max-w-lg animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-4xl font-bold mb-2">Secure Recovery</h2>
                <p className="text-white/90 text-lg">Your Security Matters</p>
              </div>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">
              We'll send you a secure verification code to reset your password. 
              Your account security is our top priority with industry-leading encryption.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-200">
                <div className="text-3xl font-bold mb-1">6-Digit</div>
                <div className="text-sm text-white/80 font-medium">Secure Code</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-200">
                <div className="text-3xl font-bold mb-1">5 Min</div>
                <div className="text-sm text-white/80 font-medium">Valid Period</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}
