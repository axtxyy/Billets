import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Check, Loader2 } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('submitting');
    setMessage('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success (replace with real API)
    setStatus('success');
    setMessage('Thank you for subscribing! Exclusive offers coming your way.');
    setEmail('');

    // Reset status after a few seconds
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 5000);
  };

  return (
    <section
      id="newsletter"
      className="py-24 md:py-32 px-6 bg-charcoal"
      aria-labelledby="newsletter-heading"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          animate={{ scale: status === 'success' ? 1.02 : 1 }}
          className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-4xl p-8 md:p-12 text-center overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-royalgold/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-bronze/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-royalgold/10 text-royalgold text-sm font-medium rounded-full border border-royalgold/20 mb-6"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>Exclusive Access</span>
            </motion.div>

            <motion.h2
              id="newsletter-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-warmwhite mb-4 leading-tight"
            >
              Join the{' '}
              <span className="font-medium text-royalgold">Inner Circle</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-softgray text-lg mb-8 max-w-xl mx-auto leading-relaxed"
            >
              Receive curated invitations to private events, early access to seasonal packages, and bespoke travel inspirations.
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-md mx-auto"
            >
              <div className="relative flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-softgray" aria-hidden="true" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={status === 'submitting' || status === 'success'}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-warmwhite placeholder-softgray/50 focus:outline-none focus:ring-2 focus:ring-royalgold/50 focus:border-royalgold/50 transition-all disabled:opacity-50"
                    aria-label="Email address"
                    aria-describedby="newsletter-message"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={status === 'submitting' || status === 'success'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-royalgold text-charcoal rounded-xl font-semibold hover:bg-royalgold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-royalgold/30"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      <span>Subscribing...</span>
                    </>
                  ) : status === 'success' ? (
                    <>
                      <Check className="w-5 h-5" aria-hidden="true" />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </motion.button>
              </div>

              <motion.p
                id="newsletter-message"
                initial={false}
                animate={{ opacity: status === 'error' || status === 'success' ? 1 : 0, y: status === 'error' || status === 'success' ? 0 : 10 }}
                className={`mt-4 text-sm ${status === 'error' ? 'text-red-400' : status === 'success' ? 'text-emerald-400' : ''}`}
                role="alert"
                aria-live="polite"
              >
                {message}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 text-xs text-softgray/60"
              >
                By subscribing, you agree to our{' '}
                <a href="#" className="text-royalgold hover:underline">Privacy Policy</a>{' '}
                and{' '}
                <a href="#" className="text-royalgold hover:underline">Terms of Service</a>.{' '}
                Unsubscribe anytime.
              </motion.p>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}