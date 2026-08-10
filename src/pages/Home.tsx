import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import BookingCard from '../components/BookingCard';
import Welcome from '../components/Welcome';
import FeaturedRooms from '../components/FeaturedRooms';
import LuxuryExperiences from '../components/LuxuryExperiences';
import GalleryPreview from '../components/GalleryPreview';
import Testimonials from '../components/Testimonials';
import LuxuryQuotes from '../components/LuxuryQuotes';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-warmwhite">
      <Navbar />
      <main id="main-content" className="pt-20">
        <Hero />
        <BookingCard />
        <Welcome />
        <FeaturedRooms />
        <LuxuryExperiences />
        <GalleryPreview />
        <Testimonials />
        <LuxuryQuotes />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}