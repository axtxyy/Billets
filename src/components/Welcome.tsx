import { motion } from 'framer-motion';

export default function Welcome() {
  return (
    <section
      id="welcome"
      className="py-24 md:py-32 px-6 bg-warmwhite"
      aria-labelledby="welcome-heading"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
              <motion.img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Billets Luxury Resort exterior view"
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
              {/* Decorative gold line */}
              <div className="absolute -bottom-6 -left-6 w-24 h-0.5 bg-royalgold" />
              <div className="absolute -bottom-6 -left-6 w-0.5 h-24 bg-royalgold" />
              <div className="absolute -top-6 -right-6 w-24 h-0.5 bg-royalgold" />
              <div className="absolute -top-6 -right-6 w-0.5 h-24 bg-royalgold" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1 bg-royalgold/10 text-royalgold text-sm font-medium rounded-full tracking-wider uppercase mb-6 border border-royalgold/20">
              Our Story
            </span>
            <h2
              id="welcome-heading"
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-charcoal leading-tight mb-6 tracking-tight"
            >
              A Legacy of{' '}
              <span className="font-medium text-royalgold">Refined</span>{' '}
              Hospitality
            </h2>
            <div className="space-y-6 text-softgray leading-relaxed text-lg">
              <p>
                Nestled along the pristine coastline of Mangalore, Karnataka, Billets stands as a testament to timeless luxury.
                Inspired by the regal heritage of the region and the tranquil rhythm of the Arabian Sea, our resort offers an
                escape where every detail is curated for the discerning traveler.
              </p>
              <p>
                From the moment you arrive, you are enveloped in an atmosphere of understated elegance—where contemporary design
                meets traditional craftsmanship. Our 84 suites and villas blend seamless indoor-outdoor living with panoramic
                ocean vistas, private plunge pools, and bespoke furnishings sourced from master artisans across India.
              </p>
              <p>
                At Billets, luxury is not merely experienced—it is felt. It is the warmth of personalized service that anticipates
                your every need. It is the taste of coastal Karnataka reimagined by world-class chefs. It is the sound of waves
                lulling you into the most restful sleep of your life.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <button className="bg-charcoal text-warmwhite px-8 py-3 rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors">
                Discover Our Heritage
              </button>
              <button className="border-2 border-royalgold text-royalgold px-8 py-3 rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors">
                View Accommodations
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}