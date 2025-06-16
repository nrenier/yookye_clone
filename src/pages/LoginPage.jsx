import { Box } from '@mui/material';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = ({ setUser }) => {
  return (
    <Box>
      <Header />
      <LoginForm setUser={setUser}/>
      <Footer />
    </Box>
  );
}

export default LoginPage;