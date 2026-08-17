import { motion } from 'framer-motion';
import { Calendar, Users, ChevronDown, Search, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type RoomType = 'deluxe' | 'suite' | 'presidential' | 'ocean-view';

interface BookingData {
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: RoomType;
}

const roomTypes: { value: RoomType; label: string }[] = [
  { value: 'deluxe', label: 'Deluxe Room' },
  { value: 'suite', label: 'Luxury Suite' },
  { value: 'presidential', label: 'Presidential Suite' },
  { value: 'ocean-view', label: 'Ocean View Suite' },
];

export default function BookingCard() {
  const navigate = useNavigate();
  const [data, setData] = useState<BookingData>({
    checkIn: '',
    checkOut: '',
    guests: 2,
    roomType: 'deluxe',
  });
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (field: keyof BookingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const checkIn = data.checkIn || new Date().toISOString().split('T')[0];
    const checkOut = data.checkOut || new Date(Date.parse(checkIn) + 86400000).toISOString().split('T')[0];
    
    const searchParams = new URLSearchParams({
      checkIn,
      checkOut,
      adults: data.guests.toString(),
      children: '0',
      roomType: data.roomType,
    });
    
    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className="relative -mt-20 z-20 px-6"
      role="search"
      aria-label="Booking search"
    >
      <div className="max-w-5xl mx-auto">
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-softgray/20 p-6 md:p-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            {/* Check-in */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="relative"
            >
              <label htmlFor="checkIn" className="block text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-2">
                Check-in
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-royalgold" aria-hidden="true" />
                <input
                  id="checkIn"
                  type="date"
                  value={data.checkIn}
                  onChange={e => handleChange('checkIn', e.target.value)}
                  onFocus={() => setFocused('checkIn')}
                  className={`w-full pl-12 pr-4 py-3 bg-warmwhite border-2 rounded-xl text-charcoal placeholder-softgray/50 focus:outline-none focus:ring-2 focus:ring-royalgold/50 transition-all ${
                    focused === 'checkIn' ? 'border-royalgold' : 'border-softgray/30 hover:border-royalgold/50'
                  }`}
                  aria-label="Check-in date"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </motion.div>

            {/* Check-out */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="relative"
            >
              <label htmlFor="checkOut" className="block text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-2">
                Check-out
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-royalgold" aria-hidden="true" />
                <input
                  id="checkOut"
                  type="date"
                  value={data.checkOut}
                  onChange={e => handleChange('checkOut', e.target.value)}
                  onFocus={() => setFocused('checkOut')}
                  min={data.checkIn || new Date().toISOString().split('T')[0]}
                  className={`w-full pl-12 pr-4 py-3 bg-warmwhite border-2 rounded-xl text-charcoal placeholder-softgray/50 focus:outline-none focus:ring-2 focus:ring-royalgold/50 transition-all ${
                    focused === 'checkOut' ? 'border-royalgold' : 'border-softgray/30 hover:border-royalgold/50'
                  }`}
                  aria-label="Check-out date"
                />
              </div>
            </motion.div>

            {/* Guests */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="relative"
            >
              <label htmlFor="guests" className="block text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-royalgold" aria-hidden="true" />
                <select
                  id="guests"
                  value={data.guests}
                  onChange={e => handleChange('guests', Number(e.target.value))}
                  onFocus={() => setFocused('guests')}
                  className="w-full pl-12 pr-10 py-3 bg-warmwhite border-2 border-softgray/30 rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-royalgold/50 focus:border-royalgold transition-all appearance-none cursor-pointer"
                  aria-label="Number of guests"
                >
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/50 pointer-events-none" aria-hidden="true" />
              </div>
            </motion.div>

            {/* Room Type */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="relative"
            >
              <label htmlFor="roomType" className="block text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-2">
                Room Type
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-royalgold" aria-hidden="true" />
                <select
                  id="roomType"
                  value={data.roomType}
                  onChange={e => handleChange('roomType', e.target.value as RoomType)}
                  onFocus={() => setFocused('roomType')}
                  className="w-full pl-12 pr-10 py-3 bg-warmwhite border-2 border-softgray/30 rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-royalgold/50 focus:border-royalgold transition-all appearance-none cursor-pointer"
                  aria-label="Room type"
                >
                  {roomTypes.map(rt => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/50 pointer-events-none" aria-hidden="true" />
              </div>
            </motion.div>

            {/* Search Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, boxShadow: '0 15px 30px rgba(201,168,76,0.4)' }}
              whileTap={{ scale: 0.98 }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="bg-royalgold text-charcoal py-3 px-8 rounded-xl font-semibold text-lg hover:bg-royalgold/90 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-royalgold/30"
              aria-label="Search availability"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
              Check Availability
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </motion.button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
}