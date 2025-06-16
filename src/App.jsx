import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import FormPage from './pages/FormPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { auth } from './services/api';

// Yookye theme colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#db213f',
    },
    secondary: {
      main: '#3e3f45',
    },
    background: {
      default: '#f9f8fb',
    },
  },
  typography: {
    fontFamily: 'Nunito, Arial, sans-serif',
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app start
    const checkAuth = async () => {
      if (auth.isAuthenticated()) {
        try {
          // Try to get user profile to verify token is still valid
          const response = await auth.getProfile();
          setUser(response.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Clear invalid tokens
          auth.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading...
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
          <Route path="/home" element={<HomePage user={user} setUser={setUser} />} />
          <Route path="/form" element={<FormPage user={user} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;