import { motion, useAnimation, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  title: string;
  location: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Billets redefines luxury. From the moment we arrived, every detail was anticipated. The ocean-view suite took our breath away, and the personalized butler service made us feel like royalty.",
    author: "Priya & Arjun Sharma",
    title: "Anniversary Celebration",
    location: "Mumbai, India",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  },
  {
    id: 2,
    quote: "The spa experience at Billets is transcendent. The Ayurvedic treatments in the oceanfront pavilion, combined with the sound of waves, created the most profound relaxation I've ever experienced.",
    author: "Dr. Sarah Mitchell",
    title: "Wellness Retreat Guest",
    location: "London, UK",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  },
  {
    id: 3,
    quote: "As a culinary enthusiast, I was blown away by the dining program. Each restaurant offers a distinct narrative—coastal Karnataka flavors elevated to haute cuisine. The chef's table at The Pearl is unforgettable.",
    author: "Marcus Chen",
    title: "Food Critic & Travel Writer",
    location: "Singapore",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  },
  {
    id: 4,
    quote: "We hosted our destination wedding at Billets, and it was nothing short of magical. The events team orchestrated every detail flawlessly—the beach ceremony at sunset, the reception under the stars. Pure perfection.",
    author: "Ananya & Vikram Reddy",
    title: "Wedding Couple",
    location: "Bangalore, India",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });

  const goTo = (index: number) => {
    const clamped = (index + testimonials.length) % testimonials.length;
    setCurrentIndex(clamped);
    x.set(-clamped * 100);
  };

  const next = () => goTo(currentIndex + 1);
  const prev = () => goTo(currentIndex - 1);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    setTouchStart(null);
  };

  const current = testimonials[currentIndex];

  return (
    <section
      id="testimonials"
      className="py-24 md:py-32 px-6 bg-charcoal"
      aria-labelledby="testimonials-heading"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-royalgold/20 text-royalgold text-sm font-medium rounded-full tracking-wider uppercase mb-4 border border-royalgold/30">
            Guest Stories
          </span>
          <h2
            id="testimonials-heading"
            className="font-heading text-4xl md:text-5xl font-light text-warmwhite mb-4"
          >
            Voices of{' '}
            <span className="font-medium text-royalgold">Delight</span>
          </h2>
          <p className="text-softgray max-w-2xl mx-auto text-lg">
            Authentic experiences from discerning travelers who discovered their sanctuary at Billets.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <motion.div
            animate={{ x: springX }}
            style={{ x: springX }}
            className="overflow-hidden"
            role="region"
            aria-label="Guest testimonials carousel"
          >
            <div className="flex" style={{ width: `${testimonials.length * 100}%` }}>
              {testimonials.map((t) => (
                <motion.div
                  key={t.id}
                  style={{ width: `${100 / testimonials.length}%`, flexShrink: 0 }}
                  className="px-4"
                >
                  <article className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="inline-flex items-center gap-1 mb-6 text-royalgold"
                      aria-label="Five star rating"
                    >
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" aria-hidden="true" />
                      ))}
                    </motion.div>

                    <motion.blockquote
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="relative"
                    >
                      <Quote className="absolute -top-8 -left-8 w-16 h-16 text-royalgold/20" aria-hidden="true" />
                      <p className="font-heading text-2xl md:text-3xl font-light text-warmwhite leading-relaxed mb-8 relative z-10">
                        "{current.quote}"
                      </p>
                    </motion.blockquote>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <img
                        src={current.avatar}
                        alt={current.author}
                        className="w-16 h-16 rounded-full object-cover border-2 border-royalgold/30"
                      />
                      <div>
                        <p className="font-heading text-lg font-medium text-warmwhite">{current.author}</p>
                        <p className="text-royalgold text-sm">{current.title}</p>
                        <p className="text-softgray text-sm">{current.location}</p>
                      </div>
                    </motion.div>
                  </article>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-4 mt-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-warmwhite flex items-center justify-center hover:bg-royalgold/20 hover:border-royalgold/50 transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" aria-hidden="true" />
            </motion.button>

            {/* Dots */}
            <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial navigation">
              {testimonials.map((_, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.3 }}
                  onClick={() => goTo(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentIndex
                      ? 'bg-royalgold w-8'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  role="tab"
                  aria-selected={i === currentIndex}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-warmwhite flex items-center justify-center hover:bg-royalgold/20 hover:border-royalgold/50 transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}