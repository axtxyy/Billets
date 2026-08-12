import { useParams, Link } from "react-router-dom";
import { hotel } from "../data/hotel";
import { motion } from "framer-motion";

const eventsData: Record<string, any> = {
  weddings: {
    title: "Weddings",
    description:
      "Celebrate your big day with the sound of waves as your backdrop. Our team helps with decor, catering, and accommodation for guests.",
    capacity: "Up to 100 guests",
    facilities: ["Beachside mandap", "Sound system", "Bridal suite", "Catering partnership"],
  },
  birthday: {
    title: "Birthday Parties",
    description:
      "From kids' themes to adult soirées, we provide flexible indoor/outdoor space, decoration packages, and food options.",
    capacity: "Up to 50 guests",
    facilities: ["Game area", "Music system", "Custom cake tie‑up", "Photo booth"],
  },
  corporate: {
    title: "Corporate Meetings",
    description:
      "Productive off‑site meetings with high‑speed Wi‑Fi, projector, whiteboard, and refreshments.",
    capacity: "Up to 30 guests",
    facilities: ["Projector & screen", "Whiteboard", "High‑speed Wi‑Fi", "Tea/coffee"],
  },
  conference: {
    title: "Conferences",
    description:
      "Full‑day conference hall with breakout rooms, AV equipment, and lunch buffet.",
    capacity: "Up to 80 guests",
    facilities: ["Main hall", "2 breakout rooms", "AV & live streaming", "Lunch & snacks"],
  },
  anniversary: {
    title: "Anniversary Celebrations",
    description:
      "Romantic beachfront setup with candlelight dinner, floral decor, and personalized menu.",
    capacity: "Up to 40 guests",
    facilities: ["Private beach area", "Candlelight dinner", "Floral decor", "Custom menu"],
  },
  banquet: {
    title: "Banquets",
    description:
      "Spacious hall for large gatherings – weddings receptions, family reunions, community events.",
    capacity: "Up to 150 guests",
    facilities: ["Banquet hall", "Stage & mic", "Buffet catering", "Parking"],
  },
};

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const ev = eventsData[eventId || ""];

  if (!ev) return <div className="p-8 text-center">Event not found</div>;

  return (
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
          <div>
            <img
              src={hotel.heroImage}
              alt={ev.title}
              className="w-full rounded-2xl shadow-lg object-cover h-[500px]"
            />
          </div>

          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-light text-charcoal mb-2">
              {ev.title}
            </h1>
            <p className="text-softgray mb-6">{ev.description}</p>

            <div className="mb-6">
              <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                Capacity
              </h3>
              <p className="text-softgray">{ev.capacity}</p>
            </div>

            <div className="mb-8">
              <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                Facilities Included
              </h3>
              <ul className="list-disc list-inside text-softgray space-y-1">
                {ev.facilities.map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <a
                href={`tel:${hotel.phone}`}
                className="flex-1 py-3 bg-charcoal text-warmwhite rounded-full font-medium text-lg text-center hover:bg-royalgold hover:text-charcoal transition-colors"
              >
                Call to Book
              </a>
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
  );
}