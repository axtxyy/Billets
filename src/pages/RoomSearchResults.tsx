import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calendar, Users, MapPin, Star, ArrowRight } from 'lucide-react';
import { roomsApi, getImageUrl } from '../services/api';
import { PageHero } from '../components/PageHero';
import RoomModal from '../components/RoomModal';
import type { RoomDisplay } from '../data/roomTypes';

interface SearchParams {
  checkIn: string;
  checkOut: string;
  adults: string;
  children: string;
  roomType: string;
  roomId: string;
}

export default function RoomSearchResults() {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState<RoomDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomDisplay | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  const params: SearchParams = {
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    adults: searchParams.get('adults') || '2',
    children: searchParams.get('children') || '0',
    roomType: searchParams.get('roomType') || '',
    roomId: searchParams.get('roomId') || '',
  };

  useEffect(() => {
    const fetchRooms = async () => {
      if (!params.checkIn || !params.checkOut) return;
      try {
        setLoading(true);
        const response = await roomsApi.search({
          check_in_date: params.checkIn,
          check_out_date: params.checkOut,
          adults: parseInt(params.adults, 10),
          children: parseInt(params.children, 10),
          room_type: params.roomType || undefined,
          page: 1,
          size: 20,
        });
        if (response.success && response.data) {
          const mappedRooms: RoomDisplay[] = response.data.rooms.map((item: any) => {
            const room = item.room;
            const primaryImg = room.images?.find((img: any) => img.is_primary);
            const imageUrl = primaryImg?.image_url || room.primary_image;
            return {
              id: String(room.id),
              name: room.name,
              description: room.description || '',
              price: room.price_per_night,
              originalPrice: room.price_per_night * 1.25,
              taxesAndFees: Math.round(room.price_per_night * 0.12),
              image: getImageUrl(imageUrl) || imageUrl || '',
              gallery: imageUrl ? [getImageUrl(imageUrl) || imageUrl] : [],
              features: room.amenities?.map((a: any) => a.name) || [],
              capacity: room.capacity,
              bedType: room.bed_type || undefined,
              cancellation: 'Free cancellation till 24 hrs before check-in',
              policies: [
                'Book with ₹0 payment – pay before check-in to avoid auto-cancellation',
                '100% Refundable',
              ],
            };
          });
          setRooms(mappedRooms);
          setTotalResults(response.data.total);

          // Auto-select room if roomId is provided
          if (params.roomId) {
            const targetRoom = mappedRooms.find(r => r.id === params.roomId);
            if (targetRoom) {
              setSelectedRoom(targetRoom);
            }
          }
        } else {
          setError(response.message || 'No rooms found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to search rooms');
        console.error('Error searching rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [params]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const nights = params.checkIn && params.checkOut
    ? Math.ceil((new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <>
        <PageHero
          title="Search Results"
          subtitle={`Found ${totalResults} available rooms`}
          backgroundImage="https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg"
        />
        <section className="py-12 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <motion.article
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative bg-white rounded-3xl overflow-hidden shadow-lg border border-softgray/20 animate-pulse"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-softgray/20" />
                  <div className="p-6 space-y-4">
                    <div className="h-8 bg-softgray/20 rounded w-3/4" />
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
          title="Search Results"
          subtitle={`Found ${totalResults} available rooms`}
          backgroundImage="https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg"
        />
        <section className="py-12 px-6 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Link
              to="/"
              className="px-6 py-2 bg-charcoal text-warmwhite rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors"
            >
              New Search
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Available Rooms"
        subtitle={`${totalResults} room${totalResults !== 1 ? 's' : ''} found for your dates`}
        backgroundImage="https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg"
      />
      <section className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Search Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-warmwhite rounded-2xl border border-softgray/20"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-softgray">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-royalgold" />
                  <span>{formatDate(params.checkIn)} - {formatDate(params.checkOut)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-royalgold" />
                  <span>{params.adults} Adults{params.children !== '0' ? `, ${params.children} Children` : ''}</span>
                </div>
                {params.roomType && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-royalgold" />
                    <span>{params.roomType.charAt(0).toUpperCase() + params.roomType.slice(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-current text-royalgold" />
                  <span>{nights} Night{nights !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <Link
                to="/"
                className="text-royalgold hover:underline font-medium flex items-center gap-1"
              >
                Modify Search
              </Link>
            </div>
          </motion.div>

          {rooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-softgray/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-softgray/50" />
              </div>
              <h3 className="font-heading text-2xl text-charcoal mb-2">No rooms available</h3>
              <p className="text-softgray mb-6 max-w-md mx-auto">
                We couldn't find any rooms matching your criteria. Try adjusting your dates or guest count.
              </p>
              <Link to="/" className="px-6 py-2 bg-charcoal text-warmwhite rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors">
                New Search
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h2 className="font-heading text-2xl font-medium text-charcoal">
                  Showing {rooms.length} of {totalResults} available room{totalResults !== 1 ? 's' : ''}
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room, index) => (
                  <motion.article
                    key={room.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8, boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }}
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-lg border border-softgray/20 hover:border-royalgold/30 transition-all duration-500"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <motion.img
                        src={room.image}
                        alt={`${room.name} at Billets`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-warmwhite">
                          <MapPin className="w-4 h-4" aria-hidden="true" />
                          <span className="text-sm font-medium">Mangalore, Karnataka</span>
                        </div>
                        <div className="flex items-center gap-1 text-royalgold">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" aria-hidden="true" />
                          ))}
                          <span className="text-sm font-medium ml-1">5.0</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-heading text-2xl font-light text-charcoal mb-2 group-hover:text-royalgold transition-colors">
                        {room.name}
                      </h3>
                      <p className="text-softgray mb-4 line-clamp-2">{room.description}</p>

                      <ul className="flex flex-wrap gap-3 mb-6" aria-label="Room features">
                        {room.features.map((feat, i) => (
                          <li
                            key={i}
                            className="px-3 py-1 bg-warmwhite text-sm text-charcoal/70 rounded-full border border-softgray/30"
                          >
                            {feat}
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between pt-4 border-t border-softgray/20">
                        <div>
                          <span className="font-heading text-3xl font-medium text-charcoal">
                            ₹{room.price.toLocaleString()}
                          </span>
                          {room.originalPrice && room.originalPrice > room.price && (
                            <span className="text-softgray text-sm ml-2 line-through">
                              ₹{room.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="text-softgray text-sm ml-2">/ night</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedRoom(room)}
                          className="group relative px-6 py-2.5 bg-charcoal text-warmwhite rounded-full font-medium text-sm hover:bg-royalgold hover:text-charcoal transition-colors flex items-center gap-2 overflow-hidden"
                        >
                          View Details
                          <ArrowRight
                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </motion.button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {selectedRoom && (
        <RoomModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          checkIn={params.checkIn}
          checkOut={params.checkOut}
          guests={parseInt(params.adults, 10)}
        />
      )}
    </>
  );
}