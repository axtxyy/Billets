import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { eventsApi } from "../services/api";
import { PageHero } from "../components/PageHero";

interface EventDetail {
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

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) return;
      try {
        setLoading(true);
        const response = await eventsApi.getById(parseInt(eventId, 10));
        if (response.success && response.data) {
          setEvent(response.data);
        } else {
          setError(response.message || 'Event not found');
        }
      } catch (err) {
        setError('Failed to load event. Please try again later.');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

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

  if (loading) {
    return (
      <>
        <PageHero
          title="Event Details"
          subtitle="Loading event information..."
        />
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-royalgold border-t-transparent mx-auto mb-4" />
            <p className="text-lg text-softgray">Loading event...</p>
          </div>
        </section>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <PageHero
          title="Event Details"
          subtitle="Event not found"
        />
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-red-500 mb-4">{error || 'Event not found'}</p>
            <Link
              to="/events"
              className="px-6 py-2 bg-charcoal text-warmwhite rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors"
            >
              Back to Events
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={event.event_name}
        subtitle={`${event.event_type} • ${formatDate(event.event_date)} • ${formatTime(event.start_time)} - ${formatTime(event.end_time)}`}
      />
      <section className="py-12 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <Link to="/events" className="inline-flex items-center text-royalgold mb-6 hover:underline">
            ← Back to Events
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-12"
          >
            <div className="relative h-[500px] bg-softgray/20 rounded-2xl overflow-hidden flex items-center justify-center">
              <span className="text-8xl opacity-50">
                {getEventTypeIcon(event.event_type)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">{getEventTypeIcon(event.event_type)}</span>
                <span className="px-3 py-1 bg-royalgold/10 text-royalgold rounded-full text-sm font-medium capitalize">
                  {event.event_type}
                </span>
              </div>

              <h1 className="font-heading text-3xl md:text-4xl font-light text-charcoal mb-4">
                {event.event_name}
              </h1>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                    Date & Time
                  </h3>
                  <p className="text-softgray">{formatDate(event.event_date)}</p>
                  <p className="text-softgray">{formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                    Expected Guests
                  </h3>
                  <p className="text-softgray">{event.expected_guests} guests</p>
                </div>
              </div>

              {event.special_requirements && (
                <div className="mb-6">
                  <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                    Requirements
                  </h3>
                  <p className="text-softgray">{event.special_requirements}</p>
                </div>
              )}

              {event.estimated_cost && (
                <div className="mb-6">
                  <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                    Estimated Cost
                  </h3>
                  <p className="text-charcoal font-semibold text-xl">₹{event.estimated_cost.toLocaleString()}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                  Status
                </h3>
                <span className="px-3 py-1 bg-softgray/20 rounded-full text-sm font-medium capitalize">
                  {event.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex gap-4">
                <Link
                  to="/contact"
                  className="flex-1 py-3 border-2 border-royalgold text-royalgold rounded-full font-medium text-lg text-center hover:bg-royalgold hover:text-charcoal transition-colors"
                >
                  Enquire Now
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}