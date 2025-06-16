import { Box } from '@mui/material';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LoginForm from '../components/auth/LoginForm';

function LoginPage() {
  return (
    <Box>
      <Header />
      <LoginForm />
      <Footer />
    </Box>
  );
}

export default LoginPage;
