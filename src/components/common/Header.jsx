import {
    AppBar,
    Toolbar,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
  } from '@mui/material';
  import { Menu as MenuIcon, Language as LanguageIcon } from '@mui/icons-material';
  import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  
  function Header() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [langAnchorEl, setLangAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
  
    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
  
    const handleLangMenuOpen = (event) => {
      setLangAnchorEl(event.currentTarget);
    };
  
    const handleLangMenuClose = () => {
      setLangAnchorEl(null);
    };
  
    const menuItems = [
      { text: 'Login', path: '/login' },
      { text: 'Diventa un host', path: '/host' },
      { text: 'Diventa un esperto locale', path: '/expert' },
      { text: "Proponi un'esperienza", path: '/propose' },
      { text: 'Chi siamo', path: '/about' },
      { text: 'Contatti e supporto', path: '/contact' },
    ];
  
    return (
      <AppBar
        position="static"
        sx={{
          backgroundColor: 'white',
          color: theme.palette.secondary.main,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          {/* Logo */}
          <Box
            component="img"
            src="https://ext.same-assets.com/3634261841/451751835.png"
            alt="Yookye"
            sx={{
              height: 40,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          />
  
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {menuItems.slice(0, -2).map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  sx={{
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 400,
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
  
              {/* Language Selector */}
              <IconButton
                color="inherit"
                onClick={handleLangMenuOpen}
                sx={{ ml: 1 }}
              >
                <LanguageIcon />
              </IconButton>
  
              <Menu
                anchorEl={langAnchorEl}
                open={Boolean(langAnchorEl)}
                onClose={handleLangMenuClose}
              >
                <MenuItem onClick={handleLangMenuClose}>Italiano</MenuItem>
                <MenuItem onClick={handleLangMenuClose}>English</MenuItem>
              </Menu>
            </Box>
          )}
  
          {/* Mobile Menu */}
          {isMobile && (
            <>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                sx={{ color: theme.palette.secondary.main }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: { minWidth: 200 },
                }}
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.text}
                    onClick={() => {
                      navigate(item.path);
                      handleMenuClose();
                    }}
                  >
                    {item.text}
                  </MenuItem>
                ))}
                <MenuItem onClick={handleMenuClose}>Lingue</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
    );
  }
  
  export default Header;
  