import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PageHero } from "../components/PageHero";
import RoomModal from "../components/RoomModal";
import { roomsApi, hotelApi, type Room, getImageUrl } from "../services/api";
import type { RoomDisplay } from "../data/roomTypes";
import type { Hotel } from "../services/api";

export default function Rooms() {
  const [selectedRoom, setSelectedRoom] = useState<RoomDisplay | null>(null);
  const [rooms, setRooms] = useState<RoomDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [roomsResponse, hotelInfo] = await Promise.all([
          roomsApi.getAll({ is_featured: false, size: 20 }),
          hotelApi.getInfo(),
        ]);

        if (roomsResponse.success && roomsResponse.data) {
          const mappedRooms: RoomDisplay[] = roomsResponse.data.items.map((room: Room) => ({
            id: String(room.id),
            name: room.name,
            description: room.description || '',
            price: room.price_per_night,
            originalPrice: room.price_per_night * 1.25,
            taxesAndFees: Math.round(room.price_per_night * 0.12),
            image: getImageUrl(room.primary_image) || room.primary_image || '',
            gallery: room.primary_image ? [getImageUrl(room.primary_image) || room.primary_image] : [],
            features: room.amenities?.map((a: any) => a.name) || [],
            capacity: room.capacity,
            bedType: room.bed_type || undefined,
            cancellation: 'Free cancellation till 24 hrs before check-in',
            policies: [
              'Book with ₹0 payment – pay before check-in to avoid auto-cancellation',
              '100% Refundable',
            ],
          }));
          setRooms(mappedRooms);
        }

        setHotel(hotelInfo);
      } catch (err) {
        setError('Failed to load rooms. Please try again later.');
        console.error('Error fetching rooms:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <PageHero
          title="Our Rooms & Dorms"
          subtitle="Affordable, clean and comfortable stays near Surathkal Beach with flexible cancellation."
          backgroundImage="https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg"
        />
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <motion.article
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg border border-softgray/20 animate-pulse"
                >
                  <div className="w-full h-48 bg-softgray/20" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-softgray/20 rounded w-3/4" />
                    <div className="h-4 bg-softgray/20 rounded w-full" />
                    <div className="h-4 bg-softgray/20 rounded w-2/3" />
                    <div className="h-8 bg-softgray/20 rounded w-1/2" />
                    <div className="h-4 bg-softgray/20 rounded w-3/4" />
                  </div>
                </motion.article>
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
          title="Our Rooms & Dorms"
          subtitle="Affordable, clean and comfortable stays near Surathkal Beach with flexible cancellation."
          backgroundImage="https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg"
        />
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-charcoal text-warmwhite rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors"
            >
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
        title="Our Rooms & Dorms"
        subtitle="Affordable, clean and comfortable stays near Surathkal Beach with flexible cancellation."
        backgroundImage={hotel?.heroImage || "https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg"}
      />
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-light text-charcoal mb-8 text-center">
            Our Rooms & Dorms
          </h1>
          <p className="text-softgray max-w-2xl mx-auto text-lg text-center mb-12">
            Affordable, clean and comfortable stays near Surathkal Beach with flexible cancellation.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {rooms.map((room) => (
              <motion.article
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-softgray/20 hover:border-royalgold/30 transition-all duration-300"
              >
                <Link to={`/rooms/${room.id}`}>
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-6">
                  <Link to={`/rooms/${room.id}`}>
                    <h3 className="font-heading text-xl font-medium text-charcoal mb-2 hover:text-royalgold transition-colors">
                      {room.name}
                    </h3>
                  </Link>
                  <p className="text-softgray text-sm mb-4 line-clamp-2">{room.description}</p>
                  <ul className="flex flex-wrap gap-2 mb-4" aria-label="Room features">
                    {room.features.map((f: string, i: number) => (
                      <li
                        key={i}
                        className="px-2 py-1 bg-warmwhite text-xs text-charcoal/70 rounded-full border border-softgray/30"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-heading text-2xl font-medium text-charcoal">
                        ₹{room.price.toLocaleString()}
                      </span>
                      {room.originalPrice && room.originalPrice > room.price && (
                        <span className="text-softgray text-sm ml-2 line-through">
                          ₹{room.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-softgray text-sm ml-2">/ night</span>
                    </div>
                    <Link
                      to={`/rooms/${room.id}`}
                      className="px-4 py-2 bg-charcoal text-warmwhite rounded-full font-medium text-sm hover:bg-royalgold hover:text-charcoal transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedRoom(room);
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {selectedRoom && (
        <RoomModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </>
  );
}