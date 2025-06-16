import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  useTheme,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Header() {
  const theme = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Come funziona', path: '/come-funziona' },
    { label: 'Destinazioni', path: '/destinazioni' },
    { label: 'Contatti', path: '/contatti' },
  ];

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: theme.palette.primary.main,
        boxShadow: 'none',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1 }}>
          <Typography
            variant="h4"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: '2rem',
              color: 'white',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            yookye
          </Typography>

          <Box sx={{ display: 'flex', gap: 4 }}>
            {menuItems.map((item) => (
              <Button
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}

            <Button
              onClick={() => navigate('/login')}
              sx={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Accedi
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;