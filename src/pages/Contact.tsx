import { useState } from "react";
import { hotel } from "../data/hotel";
import { contactApi } from "../services/api";
import { PageHero } from "../components/PageHero";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await contactApi.submit({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: "General Inquiry",
        message: form.message,
      });
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="We'd love to hear from you. Reach out for bookings, events, or any queries."
        backgroundImage={hotel.heroImage}
      />
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">

        <div className="grid md:grid-cols-2 gap-12">
          {/* Info */}
          <div>
            <h2 className="font-heading text-2xl font-medium text-charcoal mb-4">Get in Touch</h2>
            <ul className="space-y-4 text-softgray">
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-royalgold/10 flex items-center justify-center text-royalgold">📍</span>
                <div>
                  <p className="font-medium text-charcoal">Address</p>
                  <p>{hotel.address.line1}, {hotel.address.line2}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-royalgold/10 flex items-center justify-center text-royalgold">📞</span>
                <div>
                  <p className="font-medium text-charcoal">Phone</p>
                  <a href={`tel:${hotel.phone}`} className="hover:text-royalgold transition-colors">{hotel.phone}</a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-royalgold/10 flex items-center justify-center text-royalgold">✉️</span>
                <div>
                  <p className="font-medium text-charcoal">Email</p>
                  <a href={`mailto:${hotel.email}`} className="hover:text-royalgold transition-colors">{hotel.email}</a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-royalgold/10 flex items-center justify-center text-royalgold">🕐</span>
                <div>
                  <p className="font-medium text-charcoal">Check‑in / Check‑out</p>
                  <p>{hotel.checkIn} / {hotel.checkOut}</p>
                </div>
              </li>
            </ul>

            <div className="mt-8">
              <h3 className="font-heading text-lg font-medium text-charcoal mb-2">Follow Us</h3>
              <div className="flex gap-4">
                <a href={hotel.social.facebook} target="_blank" rel="noopener" className="text-softgray hover:text-royalgold transition-colors" aria-label="Facebook">📘</a>
                <a href={hotel.social.instagram} target="_blank" rel="noopener" className="text-softgray hover:text-royalgold transition-colors" aria-label="Instagram">📷</a>
                <a href={hotel.social.twitter} target="_blank" rel="noopener" className="text-softgray hover:text-royalgold transition-colors" aria-label="Twitter">🐦</a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-warmwhite p-8 rounded-2xl shadow-lg">
            <h2 className="font-heading text-2xl font-medium text-charcoal mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-softgray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-royalgold"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border border-softgray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-royalgold"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-1">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-softgray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-royalgold"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-1">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2 border border-softgray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-royalgold"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-3 bg-charcoal text-warmwhite rounded-full font-medium text-lg hover:bg-royalgold hover:text-charcoal transition-colors disabled:opacity-50"
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>
              {status === "success" && (
                <p className="text-center text-green-600">Message sent successfully! We'll get back to you soon.</p>
              )}
              {status === "error" && (
                <p className="text-center text-red-600">Something went wrong. Please try again later.</p>
              )}
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-16 rounded-2xl overflow-hidden">
          <iframe
            src={hotel.mapEmbedUrl}
            width="100%"
            height={400}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Billet Mangalore Location"
          />
        </div>
      </div>
    </section>
    </>
  );
}