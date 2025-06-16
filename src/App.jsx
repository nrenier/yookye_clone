import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { auth, authAPI } from './services/api';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FormPage from './pages/FormPage';
import ProfilePage from './pages/ProfilePage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E8B57', // Sea Green
    },
    secondary: {
      main: '#FF6B35', // Orange Red
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (auth.isAuthenticated()) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.user);
          console.log('User authenticated:', response.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Clear invalid tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route path="/form" element={<FormPage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;