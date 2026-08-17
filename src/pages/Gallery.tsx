import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHero } from "../components/PageHero";
import { galleryApi, getImageUrl } from "../services/api";

interface GalleryImage {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    galleryApi.getAll().then((response) => {
      if (response.success && response.data) {
        const data = response.data.items || response.data;
        setImages(data);
        // Extract unique categories
        const cats = [...new Set(data.map((img: GalleryImage) => img.category).filter(Boolean))];
        setCategories(cats as string[]);
      } else {
        setError(response.message || 'Failed to load gallery');
      }
      setLoading(false);
    }).catch((error) => {
      console.error("Error fetching gallery:", error);
      setError('Failed to load gallery');
      setLoading(false);
    });
  }, []);

  const filteredImages = selectedCategory === "all" 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  if (loading) {
    return (
      <>
        <PageHero
          title="Photo Gallery"
          subtitle="Explore Billets through our curated collection of images."
          backgroundImage="https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg"
        />
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group cursor-pointer animate-pulse"
                >
                  <div className="w-full h-48 md:h-64 bg-softgray/20 rounded-xl" />
                </motion.div>
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
        <PageHero
          title="Photo Gallery"
          subtitle="Explore Billets through our curated collection of images."
          backgroundImage="https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg"
        />
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-charcoal text-warmwhite rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors">
              Retry
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Photo Gallery"
        subtitle="Explore Billets through our curated collection of images."
        backgroundImage={images[0] ? getImageUrl(images[0].image_url) : "https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg"}
      />
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-light text-charcoal mb-8 text-center">
            Photo Gallery
          </h1>
          <p className="text-softgray max-w-2xl mx-auto text-lg text-center mb-12">
            Explore Billets through our curated collection of images.
          </p>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-royalgold text-charcoal"
                    : "bg-softgray/30 text-charcoal hover:bg-royalgold/20"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                    selectedCategory === cat
                      ? "bg-royalgold text-charcoal"
                      : "bg-softgray/30 text-charcoal hover:bg-royalgold/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            role="list"
            aria-label="Gallery images"
          >
            {filteredImages.map((img, _idx) => (
              <motion.div
                key={img.id}
                role="listitem"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="group cursor-pointer"
                onClick={() => setLightboxIdx(images.indexOf(img))}
              >
                <img
                  src={getImageUrl(img.image_url)}
                  alt={img.title}
                  className="w-full h-48 md:h-64 object-cover rounded-xl shadow-md group-hover:shadow-xl transition-shadow duration-300"
                  loading="lazy"
                />
                <div className="mt-2 text-sm text-center">
                  <p className="font-medium text-charcoal">{img.title}</p>
                  {img.category && <p className="text-softgray capitalize">{img.category}</p>}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-softgray">No images in this category</p>
            </div>
          )}

          {/* Lightbox */}
          {lightboxIdx !== null && filteredImages[lightboxIdx] && (
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
                src={getImageUrl(filteredImages[lightboxIdx].image_url)}
                alt={filteredImages[lightboxIdx].title}
                className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
                <p className="font-medium">{filteredImages[lightboxIdx].title}</p>
                {filteredImages[lightboxIdx].description && (
                  <p className="text-sm opacity-80">{filteredImages[lightboxIdx].description}</p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}