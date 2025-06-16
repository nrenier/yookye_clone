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
          background: 'linear-gradient(135deg, #f9f8fb 0%, #e8e5f0 100%)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("https://ext.same-assets.com/3634261841/1895288797.jpeg")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.1,
            zIndex: 0,
          }}
        />
  
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 6, md: 10 },
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                fontWeight: 800,
                color: theme.palette.secondary.main,
                lineHeight: 0.9,
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              IN VIAGGIO CON
            </Typography>
  
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                fontWeight: 800,
                color: theme.palette.primary.main,
                lineHeight: 0.9,
                mb: 4,
                letterSpacing: '-0.02em',
              }}
            >
              LE TUE PASSIONI
            </Typography>
  
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 600,
                color: theme.palette.secondary.main,
                mb: 6,
                opacity: 0.8,
              }}
            >
              Esperti Locali al tuo fianco
            </Typography>
  
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/form')}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: '30px',
                textTransform: 'none',
                boxShadow: '0 8px 30px rgba(219, 33, 63, 0.3)',
                '&:hover': {
                  backgroundColor: '#c41e3a',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(219, 33, 63, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Inizia ora
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }
  
  export default Hero;
  