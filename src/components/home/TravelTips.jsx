import { Box, Typography, Container } from '@mui/material';

function TravelTips() {
  return (
    <Box sx={{ py: 8, backgroundColor: '#f9f8fb' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom>
          Travel tips
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary">
          I nostri consigli per la tua vacanza da sogno
        </Typography>
        {/* Articoli in costruzione */}
      </Container>
    </Box>
  );
}

export default TravelTips;
