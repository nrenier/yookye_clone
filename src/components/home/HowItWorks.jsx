import {
    Box,
    Typography,
    Container,
    Grid,
    Card,
    CardContent,
    useTheme,
  } from '@mui/material';
  
  function HowItWorks() {
    const theme = useTheme();
  
    const steps = [
      {
        title: 'Esprimi le tue preferenze',
        description: 'Basta lunghe e stressanti ricerche sul web per trovare la tua vacanza ideale! Per Yookye le tue preferenze sono fondamentali: esprimi i tuoi desideri tramite il form interattivo e scegli il territorio da visitare, le attività da svolgere ed i servizi di cui hai bisogno.',
        number: '1'
      },
      {
        title: 'Gli esperti',
        description: 'Le tue preferenze vengono elaborate dai nostri Esperti Locali, che quanto prima inviano via e-mail una triplice proposta composta da casa vacanza, esperienze da svolgere sul territorio e dai servizi richiesti, con la possibilità di accedere a contenuti, recensioni e foto di ognuna delle opzioni.',
        number: '2'
      },
      {
        title: 'Scegli il tuo pacchetto',
        description: 'Seleziona la tua proposta ideale o creala tra le opzioni inviate dagli Esperti Locali. La tua vacanza è quasi pronta: le tue preferenze sono diventate realtà! Scegli il tuo pacchetto e prenota!',
        number: '3'
      },
      {
        title: 'Inizia a viaggiare',
        description: 'Terminata la procedura di pagamento sei pronto a fare le valigie! Il tuo viaggio dei desideri ha inizio: tutte le tue preferenze sono state esaudite. Riceverai via mail un diario di Viaggio con date, orari e attività. In viaggio con Yookye!',
        number: '4'
      }
    ];
  
    return (
      <Box sx={{ py: 10, backgroundColor: 'white' }}>
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
              Come funziona?
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 400,
                color: theme.palette.text.secondary,
              }}
            >
              Una vacanza su misura per te
            </Typography>
          </Box>
  
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    borderRadius: 3,
                    overflow: 'visible',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  {/* Number Circle */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      zIndex: 1,
                    }}
                  >
                    {step.number}
                  </Box>
  
                  <CardContent sx={{ pt: 4, px: 3, pb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: theme.palette.secondary.main,
                        mb: 2,
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.6,
                        fontSize: '0.9rem',
                        textAlign: 'center',
                      }}
                    >
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }
  
  export default HowItWorks;
  