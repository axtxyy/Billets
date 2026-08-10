import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin as MapPinIcon,
} from 'lucide-react';

const footerLinks = {
  explore: [
    { label: 'Accommodations', href: '#rooms' },
    { label: 'Dining', href: '#dining' },
    { label: 'Spa & Wellness', href: '#amenities' },
    { label: 'Experiences', href: '#amenities' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Offers', href: '#' },
  ],
  company: [
    { label: 'About Billets', href: '#about' },
    { label: 'Careers', href: '#' },
    { label: 'Sustainability', href: '#' },
    { label: 'Press & Media', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  support: [
    { label: 'Contact Us', href: '#contact' },
    { label: 'FAQs', href: '#' },
    { label: 'Booking Policy', href: '#' },
    { label: 'Cancellation Policy', href: '#' },
    { label: 'Accessibility', href: '#' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="bg-charcoal text-warmwhite"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6" aria-label="Billets Home">
              <span className="font-heading text-3xl font-bold tracking-tight">Billets</span>
            </Link>
            <p className="text-softgray leading-relaxed mb-8 max-w-xs">
              Where the Arabian Sea meets refined luxury. An iconic resort experience on the pristine coastline of Mangalore.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-softgray hover:bg-royalgold/20 hover:border-royalgold/50 hover:text-royalgold transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Explore Column */}
          <nav aria-label="Explore links">
            <h3 className="font-heading text-lg font-medium mb-6">Explore</h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-softgray hover:text-royalgold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company Column */}
          <nav aria-label="Company links">
            <h3 className="font-heading text-lg font-medium mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-softgray hover:text-royalgold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support Column */}
          <nav aria-label="Support links">
            <h3 className="font-heading text-lg font-medium mb-6">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-softgray hover:text-royalgold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Column */}
          <div>
            <h3 className="font-heading text-lg font-medium mb-6">Contact Us</h3>
            <address className="space-y-4 not-italic text-softgray">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-royalgold mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-warmwhite">Billets Resort</p>
                  <p>NH 66, Near Surathkal</p>
                  <p>Mangalore, Karnataka 575014</p>
                  <p>India</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-royalgold flex-shrink-0" aria-hidden="true" />
                <a href="tel:+918241234567" className="hover:text-royalgold transition-colors">
                  +91 824 123 4567
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-royalgold flex-shrink-0" aria-hidden="true" />
                <a href="mailto:reservations@billets.com" className="hover:text-royalgold transition-colors">
                  reservations@billets.com
                </a>
              </div>
            </address>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-softgray text-sm">
            © {currentYear} Billets Resort. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-softgray">
            <Link to="#privacy" className="hover:text-royalgold transition-colors">Privacy Policy</Link>
            <Link to="#terms" className="hover:text-royalgold transition-colors">Terms of Service</Link>
            <Link to="#cookies" className="hover:text-royalgold transition-colors">Cookie Policy</Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-softgray/60">
            <MapPinIcon className="w-3 h-3" aria-hidden="true" />
            <span>Made with care in Mangalore</span>
          </div>
        </div>
      </div>
    </footer>
  );
}