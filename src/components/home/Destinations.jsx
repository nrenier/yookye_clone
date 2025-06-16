import {
    Box,
    Typography,
    Container,
    Grid,
    Card,
    CardMedia,
    CardContent,
    useTheme,
  } from '@mui/material';
  
  function Destinations() {
    const theme = useTheme();
  
    const destinations = [
      {
        name: 'Sardegna',
        image: 'https://ext.same-assets.com/3634261841/4195394467.jpeg',
      },
      {
        name: 'Toscana',
        image: 'https://ext.same-assets.com/3634261841/2366601393.jpeg',
      },
      {
        name: 'Sicilia',
        image: 'https://ext.same-assets.com/3634261841/2977415519.jpeg',
      },
      {
        name: 'Piemonte',
        image: 'https://ext.same-assets.com/3634261841/871407464.jpeg',
      },
      {
        name: 'Trentino-Alto Adige',
        image: 'https://ext.same-assets.com/3634261841/3917419957.jpeg',
      },
      {
        name: 'Campania',
        image: 'https://ext.same-assets.com/3634261841/3389969187.jpeg',
      },
      {
        name: 'Veneto',
        image: 'https://ext.same-assets.com/3634261841/1649650639.jpeg',
      },
      {
        name: 'Liguria',
        image: 'https://ext.same-assets.com/3634261841/4016652677.jpeg',
      },
      {
        name: 'Puglia',
        image: 'https://ext.same-assets.com/3634261841/2092527088.jpeg',
      },
      {
        name: 'Friuli-Venezia Giulia',
        image: 'https://ext.same-assets.com/3634261841/1455233757.jpeg',
      },
      {
        name: "Valle d'Aosta",
        image: 'https://ext.same-assets.com/3634261841/2007380465.jpeg',
      },
      {
        name: 'Lombardia',
        image: 'https://ext.same-assets.com/3634261841/50856494.jpeg',
      },
      {
        name: 'Emilia-Romagna',
        image: 'https://ext.same-assets.com/3634261841/3897936237.jpeg',
      },
      {
        name: 'Lazio',
        image: 'https://ext.same-assets.com/3634261841/2132692955.jpeg',
      },
      {
        name: 'Calabria',
        image: 'https://ext.same-assets.com/3634261841/4276040083.jpeg',
      },
      {
        name: 'Molise',
        image: 'https://ext.same-assets.com/3634261841/1502876482.jpeg',
      },
      {
        name: 'Basilicata',
        image: 'https://ext.same-assets.com/3634261841/427456584.jpeg',
      },
      {
        name: 'Marche',
        image: 'https://ext.same-assets.com/3634261841/441569815.jpeg',
      },
      {
        name: 'Umbria',
        image: 'https://ext.same-assets.com/3634261841/3405541966.jpeg',
      },
    ];
  
    // Show only first 8 destinations for initial display
    const displayedDestinations = destinations.slice(0, 8);
  
    return (
      <Box sx={{ py: 10, backgroundColor: '#f9f8fb' }}>
        <Container maxWidth="lg">
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
              Le nostre destinazioni
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 400,
                color: theme.palette.text.secondary,
              }}
            >
              Scopri le tipicità dei territori
            </Typography>
          </Box>
  
          <Grid container spacing={3}>
            {displayedDestinations.map((destination, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={destination.image}
                    alt={destination.name}
                    sx={{
                      objectFit: 'cover',
                    }}
                  />
                  <CardContent
                    sx={{
                      textAlign: 'center',
                      py: 2,
                      backgroundColor: 'white',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: theme.palette.secondary.main,
                      }}
                    >
                      {destination.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
  
          {/* Show all destinations link could be added here */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontStyle: 'italic',
              }}
            >
              E molte altre destinazioni...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }
  
  export default Destinations;
  