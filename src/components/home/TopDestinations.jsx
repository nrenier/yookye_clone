import { Box, Typography, Container } from '@mui/material';

function TopDestinations() {
  return (
    <Box sx={{ py: 8, backgroundColor: '#f9f8fb' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom>
          Le nostre mete
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary">
          Le vacanze più ricercate
        </Typography>
        {/* Gallery delle mete in costruzione */}
      </Container>
    </Box>
  );
}

export default TopDestinations;
