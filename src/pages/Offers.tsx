import { hotel } from "../data/hotel";

export default function Offers() {
  const offers = [
    {
      title: "Early Bird Discount",
      description: "Book 30 days in advance and get 10% off on all rooms.",
      validTill: "Valid till 31 Dec 2025",
    },
    {
      title: "Stay 3 Nights, Pay for 2",
      description: "Enjoy a complimentary night on 3-night stays.",
      validTill: "Limited period offer",
    },
    {
      title: "Group Booking Offer",
      description: "Special rates for groups of 8+ guests.",
      validTill: "Contact us for details",
    },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl font-light text-charcoal mb-8 text-center">
          Special Offers
        </h1>
        <p className="text-softgray max-w-2xl mx-auto text-lg text-center mb-12">
          Take advantage of our exclusive deals at {hotel.name}.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {offers.map((offer, i) => (
            <article
              key={i}
              className="bg-warmwhite p-8 rounded-2xl shadow-lg border border-softgray/20 hover:border-royalgold/30 transition-all duration-300"
            >
              <h3 className="font-heading text-xl font-medium text-charcoal mb-3">{offer.title}</h3>
              <p className="text-softgray mb-4">{offer.description}</p>
              <p className="text-sm text-royalgold font-medium">{offer.validTill}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}