import { Box } from '@mui/material';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import Destinations from '../components/home/Destinations';
import WhyYookye from '../components/home/WhyYookye';
import TopDestinations from '../components/home/TopDestinations';
import Testimonials from '../components/home/Testimonials';
import TravelTips from '../components/home/TravelTips';

function HomePage() {
  return (
    <Box>
      <Header />
      <Hero />
      <HowItWorks />
      <Destinations />
      <WhyYookye />
      <TopDestinations />
      <Testimonials />
      <TravelTips />
      <Footer />
    </Box>
  );
}

export default HomePage;
