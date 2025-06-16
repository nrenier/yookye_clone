import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Person,
  Settings,
  LocalOffer,
  BookmarkBorder,
  ExitToApp,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { authAPI } from '../services/api';

function ProfilePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setUser(response.user);
      setFormData({
        name: response.user.name || '',
        username: response.user.username || '',
        email: response.user.email || '',
      });
    } catch (error) {
      setError('Errore nel caricamento del profilo');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setError('');
      setSuccess('');

      const updateData = {
        name: formData.name,
        username: formData.username,
      };

      await authAPI.updateProfile(updateData);
      setSuccess('Profilo aggiornato con successo');
      setEditMode(false);
      fetchUserProfile();
    } catch (error) {
      setError('Errore nell\'aggiornamento del profilo');
      console.error('Profile update error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/');
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Il mio profilo', icon: <Person /> },
    { id: 'preferences', label: 'Le mie preferenze', icon: <Settings /> },
    { id: 'packages', label: 'I miei pacchetti', icon: <LocalOffer /> },
    { id: 'bookings', label: 'Le mie prenotazioni', icon: <BookmarkBorder /> },
  ];

  const renderProfileSection = () => (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: theme.palette.primary.main,
              fontSize: '2rem',
              mr: 3,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {user?.name || 'Nome utente'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              @{user?.username || 'username'}
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Nome completo"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={!editMode}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            disabled={!editMode}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            disabled
            sx={{ mb: 2 }}
            helperText="L'email non può essere modificata"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {!editMode ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditMode(true)}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': { backgroundColor: '#c41e3a' },
              }}
            >
              Modifica Profilo
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleUpdateProfile}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': { backgroundColor: '#c41e3a' },
                }}
              >
                Salva
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    name: user?.name || '',
                    username: user?.username || '',
                    email: user?.email || '',
                  });
                }}
              >
                Annulla
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const renderPreferencesSection = () => (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Le mie preferenze di viaggio
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Personalizza le tue preferenze per ricevere suggerimenti di viaggio su misura.
        </Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Funzionalità in arrivo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Presto potrai gestire le tue preferenze di viaggio, budget, tipologie di alloggio e molto altro.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderPackagesSection = () => (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          I miei pacchetti viaggio
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Gestisci i tuoi pacchetti viaggio personalizzati e le proposte ricevute.
        </Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LocalOffer sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nessun pacchetto disponibile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Crea la tua prima richiesta di viaggio per ricevere pacchetti personalizzati.
          </Typography>
          <Button
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: theme.palette.primary.main,
              '&:hover': { backgroundColor: '#c41e3a' },
            }}
            onClick={() => navigate('/form')}
          >
            Crea Richiesta Viaggio
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderBookingsSection = () => (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Le mie prenotazioni
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Visualizza e gestisci tutte le tue prenotazioni confermate.
        </Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <BookmarkBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nessuna prenotazione
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Le tue prenotazioni confermate appariranno qui.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'profile':
        return renderProfileSection();
      case 'preferences':
        return renderPreferencesSection();
      case 'packages':
        return renderPackagesSection();
      case 'bookings':
        return renderBookingsSection();
      default:
        return renderProfileSection();
    }
  };

  if (loading) {
    return (
      <Box>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>Caricamento...</Typography>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box>
      <Header user={user} setUser={setUser} />
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 4, color: theme.palette.secondary.main }}>
          Il mio account
        </Typography>

        <Grid container spacing={4}>
          {/* Sidebar Menu */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <List>
                {menuItems.map((item) => (
                  <ListItem key={item.id} disablePadding>
                    <ListItemButton
                      selected={selectedSection === item.id}
                      onClick={() => setSelectedSection(item.id)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#c41e3a',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: selectedSection === item.id ? 'white' : 'inherit',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
                <Divider sx={{ my: 2 }} />
                <ListItem disablePadding>
                  n>

                  <ListItemButton
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 1,
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'error.contrastText',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                      <ExitToApp />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Content Area */}
          <Grid item xs={12} md={9}>
            {renderContent()}
          </Grid>
        </Grid>
      </Container>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}>
        <DialogTitle>Conferma Logout</DialogTitle>
        <DialogContent>
          <Typography>Sei sicuro di voler uscire dal tuo account?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialog(false)}>Annulla</Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}

export default ProfilePage;