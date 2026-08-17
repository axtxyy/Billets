import { motion } from "framer-motion";
import { X, Calendar, Users, CreditCard, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingsApi } from "../services/api";
import type { RoomDisplay } from "../data/roomTypes";

interface RoomModalProps {
  room: RoomDisplay;
  onClose: () => void;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export default function RoomModal({ room, onClose, checkIn, checkOut, guests = 2 }: RoomModalProps) {
  const { accessToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleBook = async () => {
    if (!checkIn || !checkOut) {
      setBookingError("Please select check-in and check-out dates first");
      return;
    }

    if (!isAuthenticated || !accessToken) {
      setShowLoginPrompt(true);
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const response = await bookingsApi.create(
        {
          room_id: parseInt(room.id, 10),
          check_in_date: checkIn,
          check_out_date: checkOut,
          adults: guests,
          children: 0,
          special_requests: "",
        },
        accessToken
      );

      if (response.success) {
        onClose();
        navigate("/my-bookings", { state: { success: "Booking created successfully!" } });
      } else {
        setBookingError(response.message || "Failed to create booking");
      }
    } catch (err: any) {
      setBookingError(err.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = nights * room.price;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow-lg hover:bg-royalgold/10 transition-colors"
          aria-label="Close room details"
        >
          <X className="w-5 h-5 text-charcoal" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative min-h-[400px] md:min-h-0">
            <img
              src={room.image}
              alt={room.name}
              className="w-full h-full object-cover aspect-[4/3]"
            />
            {room.gallery && room.gallery.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-center">
                {room.gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="w-16 h-12 rounded overflow-hidden border-2 border-white/50 hover:border-royalgold transition-colors"
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt={`${room.name} ${i + 1}`} className="w-full h-full object-cover aspect-[4/3]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-8 overflow-y-auto">
            <h2 id="room-modal-title" className="font-heading text-3xl font-light text-charcoal mb-2">
              {room.name}
            </h2>
            <p className="text-softgray mb-6">{room.description}</p>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-heading text-4xl font-medium text-charcoal">
                ₹{room.price.toLocaleString()}
              </span>
              {room.originalPrice && room.originalPrice > room.price && (
                <span className="text-softgray text-xl line-through">
                  ₹{room.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-softgray">/ night</span>
            </div>

            {room.taxesAndFees && (
              <p className="text-sm text-softgray mb-4">
                + ₹{room.taxesAndFees.toLocaleString()} taxes & fees per night
              </p>
            )}

            <div className="mb-6">
              <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                What's included
              </h3>
              <ul className="flex flex-wrap gap-2">
                {room.features.map((f: string, i: number) => (
                  <li
                    key={i}
                    className="px-3 py-1 bg-warmwhite text-sm text-charcoal/70 rounded-full border border-softgray/30"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {room.capacity && (
              <p className="text-softgray mb-2">
                <strong>Capacity:</strong> {room.capacity} guest{room.capacity > 1 ? "s" : ""}
              </p>
            )}
            {room.bedType && (
              <p className="text-softgray mb-2">
                <strong>Bed type:</strong> {room.bedType}
              </p>
            )}
            {room.cancellation && (
              <p className="text-softgray mb-6">
                <strong>Cancellation:</strong> {room.cancellation}
              </p>
            )}

            {room.policies && room.policies.length > 0 && (
              <div className="mb-6">
                <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                  Policies
                </h3>
                <ul className="list-disc list-inside text-softgray space-y-1">
                  {room.policies.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Booking Summary */}
            {checkIn && checkOut && nights > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-warmwhite rounded-xl border border-softgray/20"
              >
                <h3 className="font-heading text-lg font-medium text-charcoal mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-softgray">
                    <span>{nights} night{nights !== 1 ? "s" : ""} × ₹{room.price.toLocaleString()}</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  {room.taxesAndFees && (
                    <div className="flex justify-between text-softgray">
                      <span>Taxes & fees ({nights} nights)</span>
                      <span>₹{(room.taxesAndFees * nights).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-softgray/30 pt-2 font-medium text-charcoal">
                    <span>Total</span>
                    <span>₹{(totalPrice + (room.taxesAndFees ? room.taxesAndFees * nights : 0)).toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-softgray">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(checkIn)} - {formatDate(checkOut)}</span>
                  <Users className="w-3 h-3" />
                  <span>{guests} guest{guests !== 1 ? "s" : ""}</span>
                </div>
              </motion.div>
            )}

            {showLoginPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-amber-800 font-medium">Login required to book</p>
                    <p className="text-amber-700 text-sm mt-1">Please log in or create an account to complete your booking.</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => { setShowLoginPrompt(false); navigate("/login"); }}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                      >
                        Log In
                      </button>
                      <button
                        onClick={() => { setShowLoginPrompt(false); navigate("/register"); }}
                        className="px-4 py-2 border border-amber-300 text-amber-800 rounded-lg font-medium hover:bg-amber-50 transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {bookingError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{bookingError}</span>
                </div>
              </motion.div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleBook}
                disabled={bookingLoading || !checkIn || !checkOut}
                className="flex-1 py-3 bg-charcoal text-warmwhite rounded-full font-medium text-lg hover:bg-royalgold hover:text-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Booking...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Book Now
                  </>
                )}
              </button>
              <a
                href="/contact"
                className="flex-1 py-3 border-2 border-royalgold text-royalgold rounded-full font-medium text-lg text-center hover:bg-royalgold hover:text-charcoal transition-colors"
              >
                Enquire
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}