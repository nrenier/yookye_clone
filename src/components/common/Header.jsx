import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import { Menu as MenuIcon, Person, ExitToApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        setUser(response.user);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setIsLoggedIn(false);
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleUserMenuClose();
    }
  };

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

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Button
                color="inherit"
                onClick={() => navigate('/')}
                sx={{ fontWeight: 500 }}
              >
                Home
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/form')}
                sx={{ fontWeight: 500 }}
              >
                Crea Viaggio
              </Button>

              {isLoggedIn ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{ p: 0 }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'white',
                        color: theme.palette.primary.main,
                        fontSize: '0.9rem',
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
                      <Person sx={{ mr: 2 }} />
                      Il mio profilo
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ExitToApp sx={{ mr: 2 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Accedi
                </Button>
              )}
            </Box>
          )}

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={() => { navigate('/'); handleMobileMenuClose(); }}>
              Home
            </MenuItem>
            <MenuItem onClick={() => { navigate('/form'); handleMobileMenuClose(); }}>
              Crea Viaggio
            </MenuItem>
            {isLoggedIn ? (
              [
                <MenuItem key="profile" onClick={() => { navigate('/profile'); handleMobileMenuClose(); }}>
                  <Person sx={{ mr: 2 }} />
                  Il mio profilo
                </MenuItem>,
                <MenuItem key="logout" onClick={() => { handleLogout(); handleMobileMenuClose(); }}>
                  <ExitToApp sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              ]
            ) : (
              <MenuItem onClick={() => { navigate('/login'); handleMobileMenuClose(); }}>
                Accedi
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;