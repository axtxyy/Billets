import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Resort exterior at sunset',
    span: 'col-span-2 row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Luxury suite interior',
    span: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Infinity pool at dusk',
    span: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Fine dining presentation',
    span: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Spa treatment room',
    span: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Beachfront view',
    span: 'col-span-2 row-span-1',
  },
];

export default function GalleryPreview() {
  return (
    <section
      id="gallery"
      className="py-24 md:py-32 px-6 bg-white"
      aria-labelledby="gallery-heading"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1 bg-royalgold/10 text-royalgold text-sm font-medium rounded-full tracking-wider uppercase mb-4 border border-royalgold/20">
              Gallery
            </span>
            <h2
              id="gallery-heading"
              className="font-heading text-4xl md:text-5xl font-light text-charcoal"
            >
              Visual{' '}
              <span className="font-medium">Journey</span>
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 bg-charcoal text-warmwhite px-6 py-3 rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors"
          >
            View Full Gallery
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {galleryImages.map((img, index) => (
            <motion.figure
              key={img.src}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ scale: 1.02 }}
              className={`relative aspect-[3/4] md:aspect-auto overflow-hidden rounded-2xl cursor-pointer ${img.span}`}
            >
              <motion.img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              <figcaption className="sr-only">{img.alt}</figcaption>
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <div className="w-full text-warmwhite">
                  <p className="text-sm font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Billets Resort</p>
                  <h4 className="font-heading text-xl font-light mt-1 opacity-0 group-hover:opacity-100 transition-opacity delay-100">{img.alt}</h4>
                </div>
              </div>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}