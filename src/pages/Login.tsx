import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHero } from '../components/PageHero';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = (location.state as any)?.from?.pathname || '/rooms';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        title="Welcome Back"
        subtitle="Sign in to your account to manage bookings and preferences"
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
              <h2 className="font-heading text-3xl font-medium text-charcoal">Sign In</h2>
              <p className="text-softgray mt-2">Enter your credentials to access your account</p>
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

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                    aria-describedby={errors.password ? 'password-error' : undefined}
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
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border-softgray/30 rounded text-royalgold focus:ring-royalgold focus:ring-2"
                  />
                  <span className="text-sm text-softgray">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-royalgold hover:underline font-medium">
                  Forgot password?
                </Link>
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-softgray">
              Don't have an account?{' '}
              <Link to="/register" className="text-royalgold font-medium hover:underline">
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}