import {
    Box,
    Typography,
    Container,
    Grid,
    Paper,
    useTheme,
    Button,
  } from '@mui/material';
  import {
    Home as HomeIcon,
    People as PeopleIcon,
    Verified as VerifiedIcon,
  } from '@mui/icons-material';
  import { useNavigate } from 'react-router-dom';
  
  function WhyYookye() {
    const theme = useTheme();
    const navigate = useNavigate();
  
    const features = [
      {
        icon: <HomeIcon sx={{ fontSize: '4rem', color: theme.palette.primary.main }} />,
        title: 'Vacanze su misura',
        description: 'Aspetto interessante, vero? Basta inutili perdite di tempo nella ricerca di una struttura, di un\'esperienza o di un servizio nel luogo scelto per le vacanze. Esprimi le tue preferenze, e Yookye le farà diventare una vacanza su misura!',
      },
      {
        icon: <PeopleIcon sx={{ fontSize: '4rem', color: theme.palette.primary.main }} />,
        title: 'Esperti Locali',
        description: 'Conoscere un territorio per visitarlo meglio e viverne la tipicità: i nostri Esperti Locali sapranno farti apprezzare il luogo delle tue vacanze, proponendoti le strutture, le esperienze ed i servizi più consoni alle tue esigenze.',
      },
      {
        icon: <VerifiedIcon sx={{ fontSize: '4rem', color: theme.palette.primary.main }} />,
        title: 'Recensioni certificate',
        description: 'Al termine della vacanza potrai recensire la tua esperienza. Le recensioni vengono registrate su blockchain a garanzia di immutabilità e trasparenza. Le recensioni non sono mai state così affidabili!',
      },
    ];
  
    return (
      <Box sx={{ py: 10, backgroundColor: 'white', position: 'relative' }}>
        {/* Background decorative element */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(219, 33, 63, 0.02) 0%, rgba(62, 63, 69, 0.02) 100%)',
            zIndex: 0,
          }}
        />
  
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                color: theme.palette.secondary.main,
                mb: 2,
              }}
            >
              Perché Yookye?
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 400,
                color: theme.palette.text.secondary,
                mb: 4,
              }}
            >
              Il portale del vero Turismo esperienziale
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
              Inizia ora
            </Button>
          </Box>
  
          <Grid container spacing={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    borderRadius: 3,
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
  
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: '1.3rem',
                      fontWeight: 600,
                      color: theme.palette.secondary.main,
                      mb: 3,
                      lineHeight: 1.3,
                    }}
                  >
                    {feature.title}
                  </Typography>
  
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.6,
                      fontSize: '1rem',
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }
  
  export default WhyYookye;  
