import { hotel } from "../data/hotel";
import { PageHero } from "../components/PageHero";

export default function Dining() {
  return (
    <>
      <PageHero
        title="Dining at Billets"
        subtitle="Enjoy a variety of local and continental dishes prepared fresh in our communal kitchenette area."
        backgroundImage={hotel.heroImage}
      />
      <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl font-light text-charcoal mb-8 text-center">
          Dining at {hotel.name}
        </h1>
        <p className="text-softgray max-w-2xl mx-auto text-lg text-center mb-12">
          Enjoy a variety of local and continental dishes prepared fresh in our communal kitchenette area. Guests are welcome to cook their own meals or order from nearby eateries.
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src={hotel.heroImage}
              alt="Dining area"
              className="w-full rounded-2xl shadow-lg"
            />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-medium text-charcoal mb-4">
              Kitchenette & Self‑Catering
            </h2>
            <ul className="space-y-3 text-softgray">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-royalgold rounded-full"></span>
                Fully equipped shared kitchenette
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-royalgold rounded-full"></span>
                Refrigerator, microwave, induction stove
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-royalgold rounded-full"></span>
                Complimentary tea/coffee
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-royalgold rounded-full"></span>
                Nearby restaurants within 500 m
              </li>
            </ul>
            <div className="mt-8">
              <h3 className="font-heading text-lg font-medium text-charcoal mb-2">
                Opening Hours
              </h3>
              <p className="text-softgray">Kitchenette accessible 24 hrs</p>
            </div>
            <a
              href={`tel:${hotel.phone}`}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-warmwhite rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors"
            >
              Call to Enquire
            </a>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}