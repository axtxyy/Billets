import { Link } from "react-router-dom";
import { rooms } from "../data/rooms";
import { hotel } from "../data/hotel";
import { PageHero } from "../components/PageHero";

export default function Rooms() {
  return (
    <>
      <PageHero
        title="Our Rooms & Dorms"
        subtitle="Affordable, clean and comfortable stays near Surathkal Beach with flexible cancellation."
        backgroundImage={hotel.heroImage}
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
            <article
              key={room.id}
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
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}