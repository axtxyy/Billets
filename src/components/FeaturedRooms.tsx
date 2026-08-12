import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { useState } from 'react';
import RoomModal from './RoomModal';

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  taxesAndFees?: number;
  image: string;
  gallery?: string[];
  features: string[];
  capacity?: number;
  bedType?: string;
  cancellation?: string;
  policies?: string[];
}

const rooms: Room[] = [
  {
    id: '2beds-combo',
    name: '2 Beds Combo (Free Cancellation)',
    description: 'Fits 2 adults. Includes kitchenette access, free cancellation up to 24 hrs before check‑in.',
    price: 1598,
    image: 'https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg',
    features: ['2 Beds', 'Free Cancellation', 'Kitchenette', 'Wi‑Fi'],
  },
  {
    id: '8bed-dorm',
    name: '8‑Bed Mixed Dormitory (per bed)',
    description: 'Shared dormitory with Wi‑Fi, private bathroom, mineral water, electronic safe, hot & cold water, toiletries.',
    price: 799,
    image: 'https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFG7ZS9YBFEHAQ5T5YPD/01KT6ZHFG7ZS9YBFEHAQ5T5YPD.jpg',
    features: ['8‑Bed Dorm', 'Wi‑Fi', 'Bathroom', 'Free Cancellation'],
  },
  {
    id: '6bed-dorm',
    name: '6‑Bed Mixed Dormitory (per bed)',
    description: 'Shared dormitory with Wi‑Fi, private bathroom, mineral water, electronic safe, hot & cold water, toiletries.',
    price: 799,
    image: 'https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFG7ZS9YBFEHAQ5T5YPD/01KT6ZHFG7ZS9YBFEHAQ5T5YPD.jpg',
    features: ['6‑Bed Dorm', 'Wi‑Fi', 'Bathroom', 'Free Cancellation'],
  },
  {
    id: 'couple-room',
    name: 'Couple Room (Double Bed)',
    description: 'Private double‑bed room with Wi‑Fi, bathroom, electronic safe, hot & cold water, toiletries, towels. Free cancellation up to 24 hrs before check‑in.',
    price: 3199,
    image: 'https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg',
    features: ['Double Bed', 'Private Bathroom', 'Free Cancellation', 'Wi‑Fi'],
  },
];

export default function FeaturedRooms() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  return (
    <section
      id="rooms"
      className="py-24 md:py-32 px-6 bg-white"
      aria-labelledby="rooms-heading"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-royalgold/10 text-royalgold text-sm font-medium rounded-full tracking-wider uppercase mb-4 border border-royalgold/20">
            Accommodations
          </span>
          <h2
            id="rooms-heading"
            className="font-heading text-4xl md:text-5xl font-light text-charcoal mb-4"
          >
            Hostel{' '}
            <span className="font-medium">Rooms</span>
            & Dorms
          </h2>
          <p className="text-softgray max-w-2xl mx-auto text-lg">
            Affordable, clean and comfortable stays near Surathkal Beach with flexible cancellation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <motion.article
              key={room.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8, boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg border border-softgray/20 hover:border-royalgold/30 transition-all duration-500"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <motion.img
                  src={room.image}
                  alt={`${room.name} at Billets Resort`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-warmwhite">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm font-medium">Mangalore, Karnataka</span>
                  </div>
                  <div className="flex items-center gap-1 text-royalgold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" aria-hidden="true" />
                    ))}
                    <span className="text-sm font-medium ml-1">5.0</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-heading text-2xl font-light text-charcoal mb-2 group-hover:text-royalgold transition-colors">
                  {room.name}
                </h3>
                <p className="text-softgray mb-4 line-clamp-2">{room.description}</p>

                <ul className="flex flex-wrap gap-3 mb-6" aria-label="Room features">
                  {room.features.map((feat, i) => (
                    <li
                      key={i}
                      className="px-3 py-1 bg-warmwhite text-sm text-charcoal/70 rounded-full border border-softgray/30"
                    >
                      {feat}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-4 border-t border-softgray/20">
                  <div>
                    <span className="font-heading text-3xl font-medium text-charcoal">
                      ₹{room.price.toLocaleString()}
                    </span>
                    <span className="text-softgray text-sm ml-2">/ night</span>
                  </div>
<motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedRoom(room)}
                      className="group relative px-6 py-2.5 bg-charcoal text-warmwhite rounded-full font-medium text-sm hover:bg-royalgold hover:text-charcoal transition-colors flex items-center gap-2 overflow-hidden"
                    >
                      View Details
                      <ArrowRight
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </motion.button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <button className="border-2 border-royalgold text-royalgold px-10 py-4 rounded-full font-medium text-lg hover:bg-royalgold hover:text-charcoal transition-colors">
            Explore All Accommodations
          </button>
        </motion.div>
      </div>

      {selectedRoom && (
        <RoomModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </section>
  );
}