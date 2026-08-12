import { useParams, Link } from "react-router-dom";
import { rooms } from "../data/rooms";
import { motion } from "framer-motion";

export default function RoomDetail() {
  const { roomId } = useParams<{ roomId: string }>();
  const room = rooms.find((r) => r.id === roomId);

  if (!room) return <div className="p-8 text-center">Room not found</div>;

  return (
    <section className="py-12 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Link to="/rooms" className="inline-flex items-center text-royalgold mb-6 hover:underline">
          ← Back to Rooms
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-12"
        >
          {/* Image Gallery */}
          <div>
            <img
              src={room.image}
              alt={room.name}
              className="w-full rounded-2xl shadow-lg object-cover h-[500px]"
            />
            {room.gallery && room.gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {room.gallery.map((img: string, i: number) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${room.name} ${i + 1}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-light text-charcoal mb-2">
              {room.name}
            </h1>
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

            <div className="mb-6">
              <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                Policies
              </h3>
              <ul className="list-disc list-inside text-softgray space-y-1">
                {room.policies?.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-charcoal text-warmwhite rounded-full font-medium text-lg hover:bg-royalgold hover:text-charcoal transition-colors">
                Book Now
              </button>
              <Link
                to="/contact"
                className="flex-1 py-3 border-2 border-royalgold text-royalgold rounded-full font-medium text-lg text-center hover:bg-royalgold hover:text-charcoal transition-colors"
              >
                Enquire
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}