import { Link } from "react-router-dom";
import { hotel } from "../data/hotel";
import { PageHero } from "../components/PageHero";
import { motion } from "framer-motion";

export default function About() {
  const stats = [
    { label: "Rooms & Dorms", value: "30+" },
    { label: "Happy Guests", value: "5000+" },
    { label: "Years Experience", value: "5" },
    { label: "Awards Won", value: "3" },
  ];

  const staff = [
    { name: "Arjun Rao", role: "General Manager", img: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Priya Shetty", role: "Front Office Manager", img: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Vikram Nair", role: "Executive Chef", img: "https://randomuser.me/api/portraits/men/45.jpg" },
  ];

  return (
    <>
      <PageHero
        title="About Billets"
        subtitle="Experience luxury, comfort, and exceptional hospitality at Billets."
        backgroundImage={hotel.heroImage}
      />
      <main className="bg-white">
        {/* Our Story */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-light text-charcoal mb-6 text-center">Our Story</h2>
            <p className="text-softgray max-w-3xl mx-auto text-lg leading-relaxed text-center">
              Billets is dedicated to offering guests a memorable experience through luxurious accommodations,
              outstanding dining, and personalized hospitality. Whether you're visiting for business or leisure,
              our hotel combines modern comfort with timeless elegance.
            </p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 px-6 bg-warmwhite">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white rounded-2xl shadow-lg"
            >
              <h3 className="font-heading text-2xl font-medium text-charcoal mb-4">Our Vision</h3>
              <p className="text-softgray leading-relaxed">
                To be the most preferred boutique hotel on the Mangalore coast, known for authentic experiences,
                sustainable practices, and heartfelt service.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white rounded-2xl shadow-lg"
            >
              <h3 className="font-heading text-2xl font-medium text-charcoal mb-4">Our Mission</h3>
              <p className="text-softgray leading-relaxed">
                Deliver unforgettable stays by blending local culture with world‑class amenities, empowering our team,
                and exceeding guest expectations every day.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-light text-charcoal mb-12 text-center">Why Choose Billets</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Luxury Rooms", desc: "Elegant rooms with premium comfort and modern facilities." },
                { title: "Fine Dining", desc: "Enjoy delicious cuisine prepared by experienced chefs." },
                { title: "Excellent Service", desc: "Our staff is available 24/7 to ensure a pleasant stay." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-8 bg-warmwhite rounded-2xl shadow-md hover:shadow-xl transition-shadow"
                >
                  <h3 className="font-heading text-xl font-medium text-charcoal mb-3">{item.title}</h3>
                  <p className="text-softgray">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards & Recognition */}
        <section className="py-20 px-6 bg-warmwhite">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-light text-charcoal mb-8">Awards & Recognition</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {["Best Boutique Hotel 2023", "Travelers' Choice 2022", "Green Hospitality Award 2021"].map((award, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="px-6 py-4 bg-white rounded-full shadow-md border border-softgray/30"
                >
                  <span className="font-medium text-charcoal">{award}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Luxury Experience */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-light text-charcoal mb-6">Luxury Experience</h2>
              <p className="text-softgray leading-relaxed mb-4">
                From the moment you step into our lobby, you are immersed in an atmosphere of refined elegance.
                Every detail — from the curated art pieces to the bespoke toiletries — is chosen to make your stay extraordinary.
              </p>
              <p className="text-softgray leading-relaxed">
                Our personalized concierge arranges private beach dinners, local tours, and wellness sessions tailored to you.
              </p>
            </div>
            <motion.img
              src={hotel.heroImage}
              alt="Luxury experience"
              className="rounded-2xl shadow-xl w-full h-96 object-cover"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            />
          </div>
        </section>

        {/* Staff */}
        <section className="py-20 px-6 bg-warmwhite">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-light text-charcoal mb-12 text-center">Our Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {staff.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-royalgold/30 mb-4"
                  />
                  <h3 className="font-heading text-lg font-medium text-charcoal">{member.name}</h3>
                  <p className="text-softgray text-sm">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="font-heading text-4xl md:text-5xl font-bold text-royalgold">{stat.value}</div>
                <div className="text-softgray mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-light text-charcoal mb-4">Ready to Stay With Us?</h2>
          <p className="text-softgray mb-8 max-w-xl mx-auto">
            Book your stay today and experience comfort like never before.
          </p>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-8 py-3 bg-charcoal text-warmwhite rounded-full font-medium hover:bg-royalgold hover:text-charcoal transition-colors"
          >
            Explore Rooms
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4-4 4" /></svg>
          </Link>
        </section>
      </main>
    </>
  );
}