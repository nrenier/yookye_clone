import { Box, Typography, Container } from '@mui/material';

function Testimonials() {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom>
          Dicono di noi
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary">
          Valuta tu stesso il servizio di Yookye
        </Typography>
        {/* Testimonianze in costruzione */}
      </Container>
    </Box>
  );
}

export default Testimonials;
