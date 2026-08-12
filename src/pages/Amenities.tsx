import { hotel } from "../data/hotel";
import { PageHero } from "../components/PageHero";
import { motion } from "framer-motion";

const amenities = [
  { icon: "📶", title: "Free WiFi", desc: "High‑speed internet throughout the property." },
  { icon: "🏊", title: "Swimming Pool", desc: "Outdoor pool with sea view and sun loungers." },
  { icon: "💆", title: "Spa", desc: "Relaxing treatments and wellness therapies." },
  { icon: "🏋️", title: "Gym", desc: "Fully equipped fitness centre open 24/7." },
  { icon: "🍽️", title: "Restaurant", desc: "Multi‑cuisine dining with local flavours." },
  { icon: "🪑", title: "Conference Hall", desc: "Modern meeting space for up to 100 guests." },
  { icon: "🛎️", title: "Room Service", desc: "Round‑the‑clock in‑room dining." },
  { icon: "🧺", title: "Laundry", desc: "Same‑day laundry and dry‑cleaning service." },
  { icon: "🅿️", title: "Parking", desc: "Complimentary secure parking for guests." },
  { icon: "✈️", title: "Airport Pickup", desc: "Scheduled shuttle service on request." },
  { icon: "🕐", title: "24/7 Reception", desc: "Friendly front desk available anytime." },
  { icon: "📹", title: "CCTV Security", desc: "Full‑property surveillance for peace of mind." },
];

export default function Amenities() {
  return (
    <>
      <PageHero
        title="Amenities"
        subtitle="Everything you need for a comfortable and memorable stay."
        backgroundImage={hotel.heroImage}
      />
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {amenities.map((item, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                className="p-8 bg-warmwhite rounded-2xl shadow-md border border-softgray/20 hover:shadow-xl hover:border-royalgold/30 transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-heading text-xl font-medium text-charcoal mb-2">{item.title}</h3>
                <p className="text-softgray text-sm leading-relaxed">{item.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}