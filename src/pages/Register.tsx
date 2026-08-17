import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHero } from '../components/PageHero';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    else if (form.full_name.trim().length < 2) newErrors.full_name = 'Name must be at least 2 characters';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.phone) newErrors.phone = 'Phone number is required';
    else if (!/^[\d\s\-\+\(\)]{10,}$/.test(form.phone)) newErrors.phone = 'Invalid phone number';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password)) newErrors.password = 'Password must contain at least one uppercase letter';
    else if (!/[a-z]/.test(form.password)) newErrors.password = 'Password must contain at least one lowercase letter';
    else if (!/[0-9]/.test(form.password)) newErrors.password = 'Password must contain at least one number';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (form.password.length >= 8) strength++;
    if (/[A-Z]/.test(form.password)) strength++;
    if (/[a-z]/.test(form.password)) strength++;
    if (/[0-9]/.test(form.password)) strength++;
    if (/[^A-Za-z0-9]/.test(form.password)) strength++;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/rooms'), 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength();
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  return (
    <>
      <PageHero
        title="Create Account"
        subtitle="Join Billets to book stays, manage reservations, and get exclusive offers"
        backgroundImage="https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg"
      />
      <section className="py-24 px-6 bg-white">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-warmwhite rounded-3xl p-8 md:p-10 shadow-lg border border-softgray/20"
          >
            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl font-medium text-charcoal">Create Account</h2>
              <p className="text-softgray mt-2">Start your journey with Billets today</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-6"
                role="alert"
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Account created successfully! Redirecting...</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-charcoal mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-softgray" aria-hidden="true" />
                  <input
                    type="text"
                    id="full_name"
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                    onBlur={() => validate()}
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-charcoal placeholder-softgray/50 focus:outline-none focus:ring-2 focus:ring-royalgold/50 transition-all ${
                      errors.full_name ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-softgray/30 hover:border-royalgold/50'
                    }`}
                    placeholder="John Doe"
                    aria-invalid={errors.full_name ? 'true' : 'false'}
                    aria-describedby={errors.full_name ? 'name-error' : undefined}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.full_name && (
                  <p id="name-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-softgray" aria-hidden="true" />
                  <input
                    type="email"
                    id="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onBlur={() => validate()}
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-charcoal placeholder-softgray/50 focus:outline-none focus:ring-2 focus:ring-royalgold/50 transition-all ${
                      errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-softgray/30 hover:border-royalgold/50'
                    }`}
                    placeholder="you@example.com"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-softgray" aria-hidden="true" />
                  <input
                    type="tel"
                    id="phone"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    onBlur={() => validate()}
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-charcoal placeholder-softgray/50 focus:outline-none focus:ring-2 focus:ring-royalgold/50 transition-all ${
                      errors.phone ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-softgray/30 hover:border-royalgold/50'
                    }`}
                    placeholder="+91 98765 43210"
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.phone && (
                  <p id="phone-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-softgray" aria-hidden="true" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onBlur={() => validate()}
                    className={`w-full pl-12 pr-14 py-3.5 bg-white border-2 rounded-xl text-charcoal placeholder-softgray/50 focus:outline-none focus:ring-2 focus:ring-royalgold/50 transition-all ${
                      errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-softgray/30 hover:border-royalgold/50'
                    }`}
                    placeholder="••••••••"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : 'password-hint'}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-softgray hover:text-charcoal transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password}
                  </p>
                )}
                {!errors.password && form.password && (
                  <div id="password-hint" className="mt-2" role="status" aria-live="polite">
                    <div className="flex gap-1 mb-1" aria-label="Password strength">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded transition-colors ${
                            level <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-softgray/30'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-softgray">
                      Password strength: <span className="font-medium">{strengthLabels[passwordStrength - 1] || 'Very Weak'}</span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-softgray" aria-hidden="true" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    onBlur={() => validate()}
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-charcoal placeholder-softgray/50 focus:outline-none focus:ring-2 focus:ring-royalgold/50 transition-all ${
                      errors.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-softgray/30 hover:border-royalgold/50'
                    }`}
                    placeholder="••••••••"
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                    aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 border-softgray/30 rounded text-royalgold focus:ring-royalgold focus:ring-2"
                  aria-required="true"
                />
                <label htmlFor="terms" className="text-sm text-softgray">
                  I agree to the{' '}
                  <Link to="/terms" className="text-royalgold hover:underline">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-royalgold hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-charcoal text-warmwhite rounded-xl font-semibold text-lg hover:bg-royalgold hover:text-charcoal transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-charcoal/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-softgray">
              Already have an account?{' '}
              <Link to="/login" className="text-royalgold font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}