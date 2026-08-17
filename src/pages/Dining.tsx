import { useState } from "react";
import { motion } from "framer-motion";
import { PageHero } from "../components/PageHero";
import { diningApi } from "../services/api";

export default function Dining() {
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    reservation_date: '',
    reservation_time: '19:00',
    guests: 2,
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await diningApi.createReservation(formData);
      if (response.success) {
        setSuccess('Reservation created successfully! Our team will confirm shortly.');
        setFormData({ customer_name: '', email: '', phone: '', reservation_date: '', reservation_time: '19:00', guests: 2, notes: '' });
        setShowReservationForm(false);
      } else {
        setError(response.message || 'Failed to create reservation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <>
      <PageHero
        title="Dining & Reservations"
        subtitle="Reserve your table at our restaurant"
        backgroundImage="/favicon.svg"
      />
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-light text-charcoal mb-8 text-center">
            Dining at Our Hotel
          </h1>
          <p className="text-softgray max-w-2xl mx-auto text-lg text-center mb-12">
            Enjoy a variety of local and continental dishes prepared fresh in our communal kitchenette area. 
            Guests are welcome to cook their own meals or reserve a table at our dining area.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="font-heading text-2xl font-medium text-charcoal mb-4">
                Kitchenette & Self‑Catering
              </h2>
              <ul className="space-y-3 text-softgray">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-royalgold rounded-full"></span>
                  Fully equipped shared kitchenette
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-royalgold rounded-full"></span>
                  Refrigerator, microwave, induction stove
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-royalgold rounded-full"></span>
                  Complimentary tea/coffee
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-royalgold rounded-full"></span>
                  Nearby restaurants within 500 m
                </li>
              </ul>
              <div className="mt-8">
                <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                  Opening Hours
                </h3>
                <p className="text-softgray">Kitchenette accessible 24 hrs</p>
              </div>
            </div>
            <div>
              <img
                src="/favicon.svg"
                alt="Dining area"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>
          </div>

          {/* Reservation Form */}
          <div className="max-w-2xl mx-auto">
            {!showReservationForm ? (
              <motion.button
                onClick={() => setShowReservationForm(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-royalgold text-charcoal rounded-xl font-semibold text-lg hover:bg-royalgold/90 transition-all duration-300 shadow-lg shadow-royalgold/30"
              >
                Reserve a Table
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-warmwhite rounded-2xl p-8 border border-softgray/20 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-2xl font-medium text-charcoal">Table Reservation</h2>
                  <button
                    onClick={() => { setShowReservationForm(false); setError(null); setSuccess(null); }}
                    className="text-softgray hover:text-charcoal"
                  >
                    ×
                  </button>
                </div>
                
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customer_name" className="block text-sm font-medium text-charcoal mb-1">Full Name *</label>
                      <input
                        type="text"
                        id="customer_name"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-softgray/30 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-royalgold/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-softgray/30 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-royalgold/50"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-1">Phone *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-softgray/30 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-royalgold/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="guests" className="block text-sm font-medium text-charcoal mb-1">Guests *</label>
                      <select
                        id="guests"
                        name="guests"
                        value={formData.guests}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-softgray/30 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-royalgold/50"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n => (
                          <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reservation_date" className="block text-sm font-medium text-charcoal mb-1">Date *</label>
                      <input
                        type="date"
                        id="reservation_date"
                        name="reservation_date"
                        value={formData.reservation_date}
                        onChange={handleChange}
                        min={minDate}
                        required
                        className="w-full px-4 py-2 border border-softgray/30 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-royalgold/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="reservation_time" className="block text-sm font-medium text-charcoal mb-1">Time *</label>
                      <input
                        type="time"
                        id="reservation_time"
                        name="reservation_time"
                        value={formData.reservation_time}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-softgray/30 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-royalgold/50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-charcoal mb-1">Special Requests</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-softgray/30 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-royalgold/50"
                      placeholder="Any special requests, dietary requirements, or occasion..."
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-charcoal text-warmwhite rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Reservation'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowReservationForm(false); setError(null); setSuccess(null); }}
                      className="flex-1 py-3 border-2 border-softgray/30 text-charcoal rounded-full font-medium hover:bg-softgray/50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}