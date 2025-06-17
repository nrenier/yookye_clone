import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import TravelForm from '../components/form/TravelForm';

const FormPage = ({ user, setUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Don't render the form if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <Box>
      <Header user={user} setUser={setUser} />
      <TravelForm user={user} />
      <Footer />
    </Box>
  );
}

export default FormPage;