import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Star } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  features: string[];
}

const rooms: Room[] = [
  {
    id: 'deluxe-ocean',
    name: 'Deluxe Ocean View',
    description: 'Spacious elegance with panoramic Arabian Sea vistas and private balcony.',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    features: ['55 sqm', 'King Bed', 'Ocean View', 'Private Balcony'],
  },
  {
    id: 'luxury-suite',
    name: 'Luxury Suite',
    description: 'Separate living area, marble bathroom with soaking tub, and butler service.',
    price: 52000,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    features: ['85 sqm', 'King Bed', 'Living Room', 'Butler Service'],
  },
  {
    id: 'presidential',
    name: 'Presidential Suite',
    description: 'Ultimate luxury with two bedrooms, private pool, dining room, and 24-hr concierge.',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    features: ['180 sqm', 'Two King Beds', 'Private Pool', 'Concierge'],
  },
];

export default function FeaturedRooms() {
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
            Curated{' '}
            <span className="font-medium">Suites</span>
            & Villas
          </h2>
          <p className="text-softgray max-w-2xl mx-auto text-lg">
            Each residence is a masterpiece of design, offering unparalleled comfort and breathtaking views.
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
    </section>
  );
}