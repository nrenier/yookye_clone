import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import { Menu as MenuIcon, Person, ExitToApp, Settings } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import logoImage from "../../assets/logo.png";

function Header({ user, setUser }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  // Use user prop directly instead of local state
  const isLoggedIn = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("access_token");
    console.log('=== HEADER AUTH CHECK ===');
    console.log('Token exists:', !!token);
    console.log('Current user:', user);
    
    if (token && !user) {
      try {
        console.log('Trying to get profile...');
        const response = await authAPI.getProfile();
        if (typeof setUser === 'function') {
          setUser(response.user);
          console.log('Profile loaded successfully:', response.user);
        } else {
          console.warn('setUser is not a function');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof setUser === 'function') {
          setUser(null);
        }
        console.log('Tokens cleared due to auth failure');
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
      console.log("=== LOGOUT PROCESS STARTED ===");
      console.log("Current user:", user);
      console.log("Token exists:", !!localStorage.getItem("access_token"));
      
      await authAPI.logout();
      
      // Clear all auth data
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      
      if (typeof setUser === 'function') {
        setUser(null);
      }
      
      console.log("Logout completed, redirecting to home");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      if (typeof setUser === 'function') {
        setUser(null);
      }
      navigate("/");
    } finally {
      handleUserMenuClose();
    }
  };

  

  const menuItems = [
    { label: "Come funziona", path: "/come-funziona" },
    { label: "Destinazioni", path: "/destinazioni" },
    { label: "Contatti", path: "/contatti" },
  ];

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: theme.palette.primary.main,
        boxShadow: "none",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1 }}>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <img
              src={logoImage}
              alt="Yookye"
              style={{
                height: "40px",
                marginRight: "10px",
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: "2rem",
                color: "white",
              }}
            >
              yookye
            </Typography>
          </Box>

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
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              <Button
                color="inherit"
                onClick={() => navigate("/")}
                sx={{ fontWeight: 500 }}
              >
                Home
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate("/form")}
                sx={{ fontWeight: 500 }}
              >
                Crea Viaggio
              </Button>

              {isLoggedIn ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "white",
                        color: theme.palette.primary.main,
                        fontSize: "0.9rem",
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        navigate("/profile");
                        handleUserMenuClose();
                      }}
                    >
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
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "white",
                    borderColor: "white",
                    fontWeight: 500,
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
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
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <MenuItem
              onClick={() => {
                navigate("/");
                handleMobileMenuClose();
              }}
            >
              Home
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate("/form");
                handleMobileMenuClose();
              }}
            >
              Crea Viaggio
            </MenuItem>
            {isLoggedIn ? (
              [
                <MenuItem
                  key="profile"
                  onClick={() => {
                    navigate("/profile");
                    handleMobileMenuClose();
                  }}
                >
                  <Person sx={{ mr: 2 }} />
                  Il mio profilo
                </MenuItem>,
                <MenuItem
                  key="debug"
                  onClick={() => {
                    handleSessionDebug();
                    handleMobileMenuClose();
                  }}
                >
                  <Settings sx={{ mr: 2 }} />
                  Debug Sessione
                </MenuItem>,
                <MenuItem
                  key="logout"
                  onClick={() => {
                    handleLogout();
                    handleMobileMenuClose();
                  }}
                >
                  <ExitToApp sx={{ mr: 2 }} />
                  Logout
                </MenuItem>,
              ]
            ) : (
              <MenuItem
                onClick={() => {
                  navigate("/login");
                  handleMobileMenuClose();
                }}
              >
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
