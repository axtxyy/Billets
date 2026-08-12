import { Link } from "react-router-dom";
import { hotel } from "../data/hotel";

const events = [
  {
    id: "weddings",
    title: "Weddings",
    description: "Intimate beachside ceremonies with customizable decor.",
    capacity: "Up to 100 guests",
    image: hotel.heroImage,
  },
  {
    id: "birthday",
    title: "Birthday Parties",
    description: "Fun-filled celebrations with games, music & catering options.",
    capacity: "Up to 50 guests",
    image: hotel.heroImage,
  },
  {
    id: "corporate",
    title: "Corporate Meetings",
    description: "Quiet workspace with Wi‑Fi, projector & refreshments.",
    capacity: "Up to 30 guests",
    image: hotel.heroImage,
  },
  {
    id: "conference",
    title: "Conferences",
    description: "Full‑day conference setup with breakout areas.",
    capacity: "Up to 80 guests",
    image: hotel.heroImage,
  },
  {
    id: "anniversary",
    title: "Anniversary Celebrations",
    description: "Romantic setup with candlelight dinner arrangement.",
    capacity: "Up to 40 guests",
    image: hotel.heroImage,
  },
  {
    id: "banquet",
    title: "Banquets",
    description: "Large gatherings with buffet & seating arrangements.",
    capacity: "Up to 150 guests",
    image: hotel.heroImage,
  },
];

export default function Events() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl font-light text-charcoal mb-8 text-center">
          Events & Celebrations
        </h1>
        <p className="text-softgray max-w-2xl mx-auto text-lg text-center mb-12">
          Host your special moments at {hotel.name} – flexible spaces near the beach.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((ev) => (
            <Link
              key={ev.id}
              to={`/events/${ev.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-softgray/20 hover:border-royalgold/30 transition-all duration-300"
            >
              <img
                src={ev.image}
                alt={ev.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-6">
                <h3 className="font-heading text-xl font-medium text-charcoal mb-2 group-hover:text-royalgold transition-colors">
                  {ev.title}
                </h3>
                <p className="text-softgray text-sm mb-3 line-clamp-2">{ev.description}</p>
                <p className="text-sm text-charcoal/70 mb-4">
                  <strong>Capacity:</strong> {ev.capacity}
                </p>
                <span className="inline-flex items-center text-royalgold font-medium text-sm">
                  View Details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}