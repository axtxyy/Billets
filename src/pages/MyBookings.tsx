import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Users, X, ArrowLeft, CreditCard, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { bookingsApi, type Booking, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHero } from '../components/PageHero';

type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';

interface BookingWithRoom extends Booking {
  // All properties from Booking are already included
}

const statusConfig: Record<BookingStatus, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  pending: { label: 'Pending Payment', icon: <Clock className="w-4 h-4" />, color: 'text-amber-700', bgColor: 'bg-amber-100' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-700', bgColor: 'bg-green-100' },
  checked_in: { label: 'Checked In', icon: <CheckCircle className="w-4 h-4" />, color: 'text-blue-700', bgColor: 'bg-blue-100' },
  checked_out: { label: 'Completed', icon: <CheckCircle className="w-4 h-4" />, color: 'text-gray-700', bgColor: 'bg-gray-100' },
  cancelled: { label: 'Cancelled', icon: <X className="w-4 h-4" />, color: 'text-red-700', bgColor: 'bg-red-100' },
  no_show: { label: 'No Show', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

export default function MyBookings() {
  const { accessToken } = useAuth();
  const [bookings, setBookings] = useState<BookingWithRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [accessToken]);

  const fetchBookings = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const response = await bookingsApi.getMyBookings(accessToken);
      if (response.success && response.data) {
        setBookings(response.data.items || response.data);
      } else {
        setError(response.message || 'Failed to load bookings');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!cancelReason.trim()) return;
    try {
      setCancellingId(bookingId);
      const response = await bookingsApi.cancel(bookingId, accessToken!, cancelReason);
      if (response.success) {
        await fetchBookings();
        setCancelReason('');
      } else {
        alert(response.message || 'Failed to cancel booking');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <>
        <PageHero title="My Bookings" subtitle="Manage your reservations" backgroundImage="/favicon.svg" />
        <section className="py-12 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-warmwhite rounded-2xl p-6 border border-softgray/20">
                  <div className="flex gap-6">
                    <div className="w-32 h-32 bg-softgray/20 rounded-xl" />
                    <div className="flex-1 space-y-4">
                      <div className="h-6 bg-softgray/20 rounded w-1/3" />
                      <div className="h-4 bg-softgray/20 rounded w-full" />
                      <div className="h-4 bg-softgray/20 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHero title="My Bookings" subtitle="Manage your reservations" backgroundImage="/favicon.svg" />
        <section className="py-12 px-6 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-heading text-2xl text-charcoal mb-2">Unable to load bookings</h3>
            <p className="text-softgray mb-6">{error}</p>
            <button onClick={fetchBookings} className="px-6 py-2 bg-charcoal text-warmwhite rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors">
              Retry
            </button>
          </div>
        </section>
      </>
    );
  }

  if (!accessToken) {
    return (
      <>
        <PageHero title="My Bookings" subtitle="Manage your reservations" backgroundImage="/favicon.svg" />
        <section className="py-12 px-6 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-heading text-2xl text-charcoal mb-2">Please log in to view your bookings</h3>
            <p className="text-softgray mb-6">You need to be logged in to see your booking history.</p>
            <Link to="/login" className="px-6 py-2 bg-charcoal text-warmwhite rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors">
              Log In
            </Link>
          </div>
        </section>
      </>
    );
  }

  const upcomingBookings = bookings.filter(b =>
    ['pending', 'confirmed', 'checked_in'].includes(b.status)
  );
  const pastBookings = bookings.filter(b =>
    ['checked_out', 'cancelled', 'no_show'].includes(b.status)
  );

  return (
    <>
      <PageHero title="My Bookings" subtitle="Manage your reservations" backgroundImage="/favicon.svg" />
      <section className="py-12 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          {upcomingBookings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h2 className="font-heading text-2xl font-medium text-charcoal mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-royalgold" />
                Upcoming Stays ({upcomingBookings.length})
              </h2>
              <div className="space-y-6">
                {upcomingBookings.map((booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                    onCancel={handleCancel}
                    cancellingId={cancellingId}
                    setCancellingId={setCancellingId}
                    cancelReason={cancelReason}
                    setCancelReason={setCancelReason}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {pastBookings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-heading text-2xl font-medium text-charcoal mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-softgray" />
                Past Stays ({pastBookings.length})
              </h2>
              <div className="space-y-6">
                {pastBookings.map((booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                    onCancel={handleCancel}
                    cancellingId={cancellingId}
                    setCancellingId={setCancellingId}
                    cancelReason={cancelReason}
                    setCancelReason={setCancelReason}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {bookings.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Calendar className="w-16 h-16 text-softgray/50 mx-auto mb-4" />
              <h3 className="font-heading text-2xl text-charcoal mb-2">No bookings yet</h3>
              <p className="text-softgray mb-6 max-w-md mx-auto">
                You haven't made any reservations yet. Start exploring our rooms and book your stay!
              </p>
              <Link to="/rooms" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-warmwhite rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors">
                <ArrowLeft className="w-5 h-5" />
                Browse Rooms
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}

interface BookingCardProps {
  booking: BookingWithRoom;
  index: number;
  onCancel: (id: number) => void;
  cancellingId: number | null;
  setCancellingId: (id: number | null) => void;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
}

function BookingCard({
  booking,
  index,
  onCancel,
  cancellingId,
  setCancellingId,
  cancelReason,
  setCancelReason,
  formatDate,
  formatCurrency,
}: BookingCardProps) {
  const status = booking.status as BookingStatus;
  const config = statusConfig[status] || statusConfig.pending;
  const primaryImg = booking.room?.images?.find(img => img.is_primary);
  const imageUrl = primaryImg?.image_url || booking.room?.primary_image || '';
  const canCancel = ['pending', 'confirmed'].includes(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-warmwhite rounded-2xl overflow-hidden shadow-md border border-softgray/20 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-48 h-48 md:h-auto min-h-[200px] bg-softgray/20 overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <img
              src={getImageUrl(imageUrl)}
              alt={booking.room?.name || 'Room'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-softgray/50">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
              {config.icon}
              {config.label}
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-heading text-xl font-medium text-charcoal">{booking.room?.name || 'Room'}</h3>
                <p className="text-softgray text-sm capitalize">{booking.room?.room_type || 'Standard'}</p>
              </div>
              <div className="text-right">
                <p className="font-heading text-xl font-bold text-charcoal">{formatCurrency(booking.total_amount)}</p>
                <p className="text-softgray text-sm">Total</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2 text-softgray">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(booking.check_in_date)} → {formatDate(booking.check_out_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-softgray">
                <Users className="w-4 h-4" />
                <span>{booking.adults} Adults{booking.children > 0 ? `, ${booking.children} Children` : ''}</span>
              </div>
            </div>

            {booking.special_requests && (
              <p className="text-sm text-softgray bg-white/50 rounded-lg p-3 mb-4">
                <span className="font-medium text-charcoal">Special Requests:</span> {booking.special_requests}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-softgray/20">
            {status === 'pending' && (
              <Link
                to={`/payment/${booking.id}`}
                className="flex-1 py-2.5 bg-royalgold text-charcoal rounded-xl font-medium text-center hover:bg-royalgold/90 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Complete Payment
              </Link>
            )}

            {canCancel && (
              <button
                onClick={() => setCancellingId(booking.id)}
                className="flex-1 py-2.5 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel Booking
              </button>
            )}

            {status === 'confirmed' && (
              <Link
                to={`/booking/${booking.id}`}
                className="flex-1 py-2.5 border-2 border-softgray/30 text-charcoal rounded-xl font-medium hover:bg-softgray/50 transition-colors text-center"
              >
                View Details
              </Link>
            )}
          </div>

          {cancellingId === booking.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl space-y-3"
            >
              <p className="text-sm text-red-700 font-medium">Please provide a reason for cancellation:</p>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="Reason for cancellation..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => onCancel(booking.id)}
                  disabled={!cancelReason.trim()}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Confirm Cancellation
                </button>
                <button
                  onClick={() => setCancellingId(null)}
                  className="flex-1 py-2 border-2 border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}