import { Box } from '@mui/material';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Hero from '../components/home/Hero';
import Categories from '../components/home/Categories';
import HowItWorks from '../components/home/HowItWorks';
import Destinations from '../components/home/Destinations';
import WhyYookye from '../components/home/WhyYookye';

const HomePage = ({ user, setUser }) => {
  return (
    <Box>
      <Header user={user} setUser={setUser} />
      <Hero />
      <Categories />
      <HowItWorks />
      <Destinations />
      <WhyYookye />
      <Footer />
    </Box>
  );
}

export default HomePage;