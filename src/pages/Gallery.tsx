import { useState } from "react";
import { hotel } from "../data/hotel";
import { rooms } from "../data/rooms";
import { motion } from "framer-motion";
import { PageHero } from "../components/PageHero";

const galleryImages = [
  { src: hotel.heroImage, alt: "Hotel exterior" },
  { src: rooms[0].image, alt: "2 Beds Combo" },
  { src: rooms[1].image, alt: "8‑Bed Dormitory" },
  { src: rooms[2].image, alt: "6‑Bed Dormitory" },
  { src: rooms[3].image, alt: "Couple Room" },
  // Add more placeholder images if needed
  { src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", alt: "Reception" },
  { src: "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800", alt: "Common area" },
  { src: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800", alt: "Beach view" },
];

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <>
      <PageHero
        title="Photo Gallery"
        subtitle="Explore Billets through our curated collection of images."
        backgroundImage={hotel.heroImage}
      />
      <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl font-light text-charcoal mb-8 text-center">
          Photo Gallery
        </h1>
        <p className="text-softgray max-w-2xl mx-auto text-lg text-center mb-12">
          Explore {hotel.name} through our curated collection of images.
        </p>

        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          role="list"
          aria-label="Gallery images"
        >
          {galleryImages.map((img, idx) => (
            <motion.div
              key={idx}
              role="listitem"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="group cursor-pointer"
              onClick={() => setLightboxIdx(idx)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-48 md:h-64 object-cover rounded-xl shadow-md group-hover:shadow-xl transition-shadow duration-300"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxIdx(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            <button
              className="absolute top-4 right-4 text-white text-3xl hover:text-royalgold transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
              aria-label="Close lightbox"
            >
              ×
            </button>
            <motion.img
              src={galleryImages[lightboxIdx].src}
              alt={galleryImages[lightboxIdx].alt}
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
              <p>{galleryImages[lightboxIdx].alt}</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
    </>
  );
}