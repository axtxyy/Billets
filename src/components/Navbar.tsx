import { motion } from 'framer-motion';
import { Menu, X, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Rooms', to: '#rooms' },
  { label: 'Dining', to: '#dining' },
  { label: 'Amenities', to: '#amenities' },
  { label: 'Gallery', to: '#gallery' },
  { label: 'About', to: '#about' },
  { label: 'Contact', to: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" aria-label="Main navigation">
        <Link to="/" className="font-heading text-2xl font-bold text-charcoal tracking-tight" aria-label="Billets Home">
          Billets
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-charcoal hover:text-royalgold transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-royalgold after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-charcoal text-warmwhite px-6 py-2 rounded-full text-sm font-medium hover:bg-royalgold hover:text-charcoal transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Book Now
          </motion.button>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-charcoal p-2"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </nav>

      <motion.div
        id="mobile-menu"
        initial={false}
        animate={{ height: mobileOpen ? 'auto' : 0, opacity: mobileOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md border-t border-softgray/30"
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="text-charcoal font-medium py-2 border-b border-softgray/30 last:border-0 hover:text-royalgold transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-2 bg-charcoal text-warmwhite px-6 py-3 rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" aria-hidden="true" />
            Book Now
          </motion.button>
        </div>
      </motion.div>
    </motion.header>
  );
}