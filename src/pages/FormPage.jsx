import { Box } from '@mui/material';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import TravelForm from '../components/form/TravelForm';

function FormPage() {
  return (
    <Box>
      <Header />
      <TravelForm />
      <Footer />
    </Box>
  );
}

export default FormPage;
