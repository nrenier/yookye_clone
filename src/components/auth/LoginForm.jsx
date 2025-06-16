import {
    Box,
    Typography,
    Container,
    Paper,
    TextField,
    Button,
    Link,
    Alert,
    useTheme,
  } from '@mui/material';
  import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { authAPI } from '../../services/api';

  function LoginForm({ setUser }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
      email: '',
      password: '',
    });

    const handleChange = (e) => {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
      if (error) setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.email || !formData.password) {
        setError('Inserisci email e password');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });

        if (response.access_token) {
          // Set user state
          setUser(response.user);
          // Redirect to home page or dashboard
          window.location.href = '/';
        }

      } catch (error) {
        console.error('Login error:', error);
        setError(error.message || 'Errore durante il login');
      } finally {
        setLoading(false);
      }
    };

    const handleRegisterRedirect = () => {
      navigate('/register');
    };

    return (
      <Box sx={{ py: 8, backgroundColor: '#f9f8fb', minHeight: '100vh' }}>
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 3,
              backgroundColor: 'white',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img
                src="/src/assets/logo.png"
                alt="Yookye"
                style={{
                  height: "60px",
                  marginBottom: "16px",
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                }}
              >
                Accedi a Yookye
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: theme.palette.text.secondary,
                mb: 4,
              }}
            >
              Accedi al tuo account per gestire i tuoi viaggi
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  required
                  type="password"
                  name="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </Box>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '25px',
                    textTransform: 'none',
                    boxShadow: '0 6px 25px rgba(219, 33, 63, 0.3)',
                    '&:hover': {
                      backgroundColor: '#c41e3a',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 35px rgba(219, 33, 63, 0.4)',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                      transform: 'none',
                      boxShadow: 'none',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? 'Accesso in corso...' : 'Accedi'}
                </Button>
              </Box>
            </form>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Non hai ancora un account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleRegisterRedirect}
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Registrati qui
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  export default LoginForm;