import { Box } from '@mui/material';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

function RegisterPage() {
  return (
    <Box>
      <Header />
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <h1>Register Page - Coming Soon</h1>
      </Box>
      <Footer />
    </Box>
  );
}

export default RegisterPage;
```

becomes

```javascript
import { useState } from 'react';
import { Box, TextField, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: '',
    acceptTerms: false
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError('L\'email è obbligatoria');
      return;
    }

    if (!formData.name.trim()) {
      setError('Il nome è obbligatorio');
      return;
    }

    if (!formData.username.trim()) {
      setError('Lo username è obbligatorio');
      return;
    }

    if (formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Devi accettare i termini e le condizioni');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        username: formData.username
      });

      if (response.status === 201) {
        navigate('/login');
      } else {
        setError('Registrazione fallita. Riprova.');
      }
    } catch (err) {
      setError('Errore durante la registrazione: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box>
      <Header />
      <Box sx={{ py: 8, textAlign: 'center', mx: 'auto', maxWidth: 500, px: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Registrati
        </Typography>
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={loading}
            sx={{ mb: 3 }}
          />
          <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  required
                  name="name"
                  label="Nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  disabled={loading}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  required
                  name="username"
                  label="Username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  disabled={loading}
                />
              </Box>
          <TextField
            fullWidth
            required
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            disabled={loading}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            required
            name="confirmPassword"
            label="Conferma Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            disabled={loading}
            sx={{ mb: 3 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.acceptTerms}
                onChange={handleChange}
                name="acceptTerms"
                color="primary"
                disabled={loading}
              />
            }
            label="Accetto i termini e le condizioni"
            sx={{ mb: 3, display: 'block' }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Registrati
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 3 }}>
          Hai già un account? <Link to="/login">Accedi</Link>
        </Typography>
      </Box>
      <Footer />
    </Box>
  );
}

export default RegisterPage;