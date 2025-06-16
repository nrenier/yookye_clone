import { Box, Typography, Container } from '@mui/material';

function Footer() {
  return (
    <Box
      sx={{
        backgroundColor: '#3e3f45',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          © 2025 Yookye s.r.l. All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
