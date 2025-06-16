import { Box } from '@mui/material';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import TravelForm from '../components/form/TravelForm';

const FormPage = ({ user, setUser }) => {
  return (
    <Box>
      <Header user={user} setUser={setUser} />
      <TravelForm user={user} />
      <Footer />
    </Box>
  );
}

export default FormPage;