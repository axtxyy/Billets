import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { RoomDisplay } from "../data/roomTypes";

interface RoomModalProps {
  room: RoomDisplay;
  onClose: () => void;
}

export default function RoomModal({ room, onClose }: RoomModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow-lg hover:bg-royalgold/10 transition-colors"
          aria-label="Close room details"
        >
          <X className="w-5 h-5 text-charcoal" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative min-h-[400px] md:min-h-0">
            <img
              src={room.image}
              alt={room.name}
              className="w-full h-full object-cover aspect-[4/3]"
            />
            {room.gallery && room.gallery.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-center">
                {room.gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="w-16 h-12 rounded overflow-hidden border-2 border-white/50 hover:border-royalgold transition-colors"
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt={`${room.name} ${i + 1}`} className="w-full h-full object-cover aspect-[4/3]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-8 overflow-y-auto">
            <h2 id="room-modal-title" className="font-heading text-3xl font-light text-charcoal mb-2">
              {room.name}
            </h2>
            <p className="text-softgray mb-6">{room.description}</p>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-heading text-4xl font-medium text-charcoal">
                ₹{room.price.toLocaleString()}
              </span>
              {room.originalPrice && room.originalPrice > room.price && (
                <span className="text-softgray text-xl line-through">
                  ₹{room.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-softgray">/ night</span>
            </div>

            {room.taxesAndFees && (
              <p className="text-sm text-softgray mb-4">
                + ₹{room.taxesAndFees.toLocaleString()} taxes & fees per night
              </p>
            )}

            <div className="mb-6">
              <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                What's included
              </h3>
              <ul className="flex flex-wrap gap-2">
                {room.features.map((f: string, i: number) => (
                  <li
                    key={i}
                    className="px-3 py-1 bg-warmwhite text-sm text-charcoal/70 rounded-full border border-softgray/30"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {room.capacity && (
              <p className="text-softgray mb-2">
                <strong>Capacity:</strong> {room.capacity} guest{room.capacity > 1 ? "s" : ""}
              </p>
            )}
            {room.bedType && (
              <p className="text-softgray mb-2">
                <strong>Bed type:</strong> {room.bedType}
              </p>
            )}
            {room.cancellation && (
              <p className="text-softgray mb-6">
                <strong>Cancellation:</strong> {room.cancellation}
              </p>
            )}

            {room.policies && room.policies.length > 0 && (
              <div className="mb-6">
                <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                  Policies
                </h3>
                <ul className="list-disc list-inside text-softgray space-y-1">
                  {room.policies.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-charcoal text-warmwhite rounded-full font-medium text-lg hover:bg-royalgold hover:text-charcoal transition-colors">
                Book Now
              </button>
              <a
                href="/contact"
                className="flex-1 py-3 border-2 border-royalgold text-royalgold rounded-full font-medium text-lg text-center hover:bg-royalgold hover:text-charcoal transition-colors"
              >
                Enquire
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}