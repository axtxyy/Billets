import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { roomsApi, getImageUrl, type Room } from "../services/api";

export default function RoomDetail() {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoom() {
      if (!roomId) return;
      try {
        setLoading(true);
        const response = await roomsApi.getById(parseInt(roomId, 10));
        if (response.success && response.data) {
          setRoom(response.data);
        } else {
          setError(response.message || 'Room not found');
        }
      } catch (err) {
        setError('Failed to load room. Please try again later.');
        console.error('Error fetching room:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoom();
  }, [roomId]);

  if (loading) {
    return (
      <section className="py-12 px-6 bg-white">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="w-full rounded-2xl shadow-lg bg-softgray/20 h-[500px]" />
            <div className="space-y-4">
              <div className="h-10 bg-softgray/20 rounded w-1/2" />
              <div className="h-6 bg-softgray/20 rounded w-3/4" />
              <div className="h-12 bg-softgray/20 rounded w-1/3" />
              <div className="h-4 bg-softgray/20 rounded w-full" />
              <div className="h-4 bg-softgray/20 rounded w-2/3" />
              <div className="h-8 bg-softgray/20 rounded w-1/2" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !room) {
    return (
      <section className="py-12 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-red-500 mb-4">{error || 'Room not found'}</p>
          <Link
            to="/rooms"
            className="inline-flex items-center text-royalgold hover:underline"
          >
            ← Back to Rooms
          </Link>
        </div>
      </section>
    );
  }

  const price = room.price_per_night;
  const originalPrice = price * 1.25;
  const taxesAndFees = Math.round(price * 0.12);
  const features = room.amenities?.map((a: any) => a.name) || [];
  const images = room.images?.map((img: any) => getImageUrl(img.image_url) || img.image_url) || (room.primary_image ? [getImageUrl(room.primary_image) || room.primary_image] : []);

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
              src={images[0] || ''}
              alt={room.name}
              className="w-full rounded-2xl shadow-lg object-cover h-[500px]"
            />
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {images.map((img: string, i: number) => (
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
            <p className="text-softgray mb-6">{room.description || ''}</p>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-heading text-4xl font-medium text-charcoal">
                ₹{price.toLocaleString()}
              </span>
              <span className="text-softgray text-xl line-through">
                ₹{originalPrice.toLocaleString()}
              </span>
              <span className="text-softgray">/ night</span>
            </div>

            {taxesAndFees && (
              <p className="text-sm text-softgray mb-4">
                + ₹{taxesAndFees.toLocaleString()} taxes & fees per night
              </p>
            )}

            <div className="mb-6">
              <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                What's included
              </h3>
              <ul className="flex flex-wrap gap-2">
                {features.map((f: string, i: number) => (
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
                <li>Free cancellation up to 24 hours before check-in</li>
                <li>Book with ₹0 payment – pay before check-in to avoid auto-cancellation</li>
                <li>100% Refundable</li>
                <li>Unmarried couples allowed. Local IDs accepted.</li>
                <li>Primary guest must be at least 18 years old.</li>
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