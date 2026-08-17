import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { eventsApi } from "../services/api";

interface EventItem {
  id: number;
  event_name: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  expected_guests: number;
  special_requirements: string | null;
  status: string;
  estimated_cost: number | null;
  created_at: string;
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    eventsApi.getAll().then((response) => {
      if (response.success && response.data) {
        setEvents(response.data.items || response.data);
      } else {
        setError(response.message || 'Failed to load events');
      }
      setLoading(false);
    }).catch((error) => {
      console.error("Error fetching events:", error);
      setError('Failed to load events');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <>
        <PageHero
          title="Events & Celebrations"
          subtitle="Host unforgettable moments at Billets Hotel."
        />
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-royalgold border-t-transparent mx-auto mb-4" />
            <p className="text-lg text-softgray">Loading events...</p>
          </div>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHero
          title="Events & Celebrations"
          subtitle="Host unforgettable moments at Billets Hotel."
        />
        <section className="py-20 px-6 bg-white">
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getEventTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      wedding: '💍',
      conference: '💼',
      party: '🎉',
      birthday: '🎂',
      anniversary: '💑',
      engagement: '💍',
      family: '👨‍👩‍👧‍👦',
      corporate: '🏢',
      social: '🥂',
      other: '📅',
    };
    return icons[type?.toLowerCase()] || '📅';
  };

  return (
    <>
      <PageHero
        title="Events & Celebrations"
        subtitle="Host unforgettable moments at Billets Hotel."
      />

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-light text-charcoal mb-4">
              Our Event Spaces
            </h2>
            <p className="text-softgray max-w-2xl mx-auto text-lg">
              From intimate gatherings to grand celebrations, our versatile event spaces 
              can accommodate any occasion with elegance and style.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-softgray/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="font-heading text-2xl text-charcoal mb-2">No events available</h3>
              <p className="text-softgray mb-6 max-w-md mx-auto">
                Check back later for upcoming events and celebrations.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 border border-softgray/20 hover:border-royalgold/30"
                >
                  <div className="relative h-48 bg-softgray/20 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-50 group-hover:opacity-100 transition-opacity">
                        {getEventTypeIcon(event.event_type)}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/90 rounded-full text-xs font-medium capitalize">
                        {event.event_type}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-medium">{formatDate(event.event_date)}</span>
                        <span className="text-sm">{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-charcoal">
                      {event.event_name}
                    </h3>

                    <p className="text-softgray mb-4 line-clamp-2">
                      {event.special_requirements || `A ${event.event_type} event for ${event.expected_guests} guests.`}
                    </p>

                    <div className="flex items-center gap-4 mb-4 text-sm text-softgray">
                      <span className="flex items-center gap-1">
                        <span>👥</span> {event.expected_guests} guests
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📍</span> Billets Hotel
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-softgray/20">
                      <span className="text-sm font-medium capitalize">
                        Status: {event.status.replace('_', ' ')}
                      </span>
                      <span className="text-royalgold font-semibold">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}