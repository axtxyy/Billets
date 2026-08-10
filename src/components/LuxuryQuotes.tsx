import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const quotes = [
  {
    id: 1,
    text: "Experience timeless elegance in the heart of Mangalore.",
    accent: "timeless elegance",
  },
  {
    id: 2,
    text: "Where every stay becomes a cherished memory.",
    accent: "cherished memory",
  },
  {
    id: 3,
    text: "Wake up to the rhythm of the Arabian Sea.",
    accent: "rhythm of the Arabian Sea",
  },
  {
    id: 4,
    text: "Luxury is not a place. It's a feeling that lingers.",
    accent: "feeling that lingers",
  },
  {
    id: 5,
    text: "Where heritage meets horizon, magic happens.",
    accent: "heritage meets horizon",
  },
];

export default function LuxuryQuotes() {
  return (
    <section
      id="quotes"
      className="py-24 md:py-32 px-6 bg-warmwhite"
      aria-labelledby="quotes-heading"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1 bg-royalgold/10 text-royalgold text-sm font-medium rounded-full tracking-wider uppercase mb-4 border border-royalgold/20">
            Philosophy
          </span>
          <h2
            id="quotes-heading"
            className="font-heading text-4xl md:text-5xl font-light text-charcoal"
          >
            The{' '}
            <span className="font-medium text-royalgold">Essence</span>
            of Billets
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quotes.map((quote, index) => (
            <motion.article
              key={quote.id}
              initial={{ opacity: 0, y: 40, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="relative group p-8 md:p-10 bg-white rounded-3xl border border-softgray/30 hover:border-royalgold/50 hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 text-royalgold/10" aria-hidden="true">
                <Quote className="w-full h-full" />
              </div>
              <div className="relative z-10">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-heading text-2xl md:text-3xl font-light text-charcoal leading-tight mb-6 relative"
                >
                  {quote.text.split(' ').map((word, i) =>
                    quote.accent.split(' ').some(aw => word.toLowerCase().includes(aw.toLowerCase().replace(/[.,]/g, '')))
                      ? <span key={i} className="text-royalgold font-medium relative">{word} </span>
                      : <span key={i}>{word} </span>
                  )}
                </motion.p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '60px' }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="h-0.5 bg-royalgold rounded"
                />
              </div>
              {/* Floating decorative element */}
              <motion.div
                animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
                className="absolute bottom-6 left-6 w-2 h-2 bg-royalgold/30 rounded-full"
                aria-hidden="true"
              />
              <motion.div
                animate={{ x: [0, 10, 0], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 + 1 }}
                className="absolute top-6 right-6 w-1 h-1 bg-bronze/30 rounded-full"
                aria-hidden="true"
              />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}