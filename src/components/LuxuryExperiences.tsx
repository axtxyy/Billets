import { motion } from 'framer-motion';
import {
  Sparkles,
  Waves,
  UtensilsCrossed,
  Sunrise,
  Dumbbell,
  Wifi,
  ArrowRight,
} from 'lucide-react';

interface Experience {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
}

const experiences: Experience[] = [
  {
    id: 'spa',
    icon: Sparkles,
    title: 'Award-Winning Spa',
    description: 'Holistic wellness journeys blending ancient Ayurvedic traditions with modern therapies in serene oceanfront pavilions.',
    gradient: 'from-royalgold/10 to-bronze/10',
  },
  {
    id: 'pool',
    icon: Waves,
    title: 'Infinity Pool',
    description: 'Edge-less pool merging with the Arabian Sea horizon, surrounded by private cabanas and poolside service.',
    gradient: 'from-blue-500/10 to-cyan-500/10',
  },
  {
    id: 'dining',
    icon: UtensilsCrossed,
    title: 'Fine Dining',
    description: 'Three Michelin-caliber restaurants showcasing coastal Karnataka flavors reimagined by world-renowned chefs.',
    gradient: 'from-amber-500/10 to-orange-500/10',
  },
  {
    id: 'view',
    icon: Sunrise,
    title: 'Ocean View',
    description: 'Every suite frames the endless Arabian Sea—sunrise yoga decks, sunset cocktail terraces, starlit private dining.',
    gradient: 'from-purple-500/10 to-pink-500/10',
  },
  {
    id: 'gym',
    icon: Dumbbell,
    title: 'State-of-the-Art Gym',
    description: 'Technogym equipment, personal trainers, ocean-view cardio studio, and dedicated yoga/pilates pavilion.',
    gradient: 'from-emerald-500/10 to-teal-500/10',
  },
  {
    id: 'wifi',
    icon: Wifi,
    title: 'High-Speed WiFi',
    description: 'Enterprise-grade fiber connectivity throughout the resort—work from paradise with seamless video conferencing.',
    gradient: 'from-indigo-500/10 to-blue-500/10',
  },
];

export default function LuxuryExperiences() {
  return (
    <section
      id="amenities"
      className="py-24 md:py-32 px-6 bg-warmwhite"
      aria-labelledby="experiences-heading"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-royalgold/10 text-royalgold text-sm font-medium rounded-full tracking-wider uppercase mb-4 border border-royalgold/20">
            Experiences
          </span>
          <h2
            id="experiences-heading"
            className="font-heading text-4xl md:text-5xl font-light text-charcoal mb-4"
          >
            Curated{' '}
            <span className="font-medium">Luxury</span>
            Experiences
          </h2>
          <p className="text-softgray max-w-2xl mx-auto text-lg">
            Every moment at Billets is designed to elevate your stay into an unforgettable journey.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp, index) => (
            <motion.article
              key={exp.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className={`group relative p-8 rounded-3xl border border-softgray/30 bg-white transition-all duration-500 hover:border-royalgold/50 hover:shadow-2xl ${exp.gradient}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-royalgold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-royalgold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-royalgold group-hover:text-charcoal transition-all duration-300 text-royalgold">
                  <exp.icon className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-xl font-medium text-charcoal mb-3">
                  {exp.title}
                </h3>
                <p className="text-softgray leading-relaxed mb-6">
                  {exp.description}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 text-royalgold font-medium hover:text-bronze transition-colors group"
                >
                  Discover
                  <ArrowRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </motion.button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}