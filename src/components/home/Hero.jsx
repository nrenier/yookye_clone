import {
  Box,
  Typography,
  Button,
  Container,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Hero() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '70vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: 'url("https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ maxWidth: '600px' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              mb: 3,
            }}
          >
            Il viaggio perfetto...
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.2rem', md: '1.4rem' },
              fontWeight: 400,
              color: 'white',
              lineHeight: 1.5,
              mb: 4,
              opacity: 0.95,
            }}
          >
            Crea il tuo pacchetto vacanza personalizzato in base alle tue passioni e preferenze
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/form')}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              px: 4,
              py: 1.5,
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
              transition: 'all 0.3s ease',
            }}
          >
            Inizia Ora
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Hero;