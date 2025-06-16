
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

function Categories() {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);

  const categories = [
    'Storia e Arte',
    'Enogastronomia', 
    'Sport',
    'Vita Locale',
    'Salute e Benessere'
  ];

  const experiences = [
    {
      title: 'Weekend Culturale a Roma',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1996&q=80',
    },
    {
      title: 'Mare e Cultura in Costiera',
      image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
    },
    {
      title: 'Avventura nelle Dolomiti',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    },
  ];

  return (
    <Box sx={{ backgroundColor: theme.palette.primary.main, py: 6 }}>
      <Container maxWidth="lg">
        {/* Category Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 'auto',
                px: 3,
                '&.Mui-selected': {
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                },
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            {categories.map((category, index) => (
              <Tab key={index} label={category} />
            ))}
          </Tabs>
        </Box>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: 'white',
            fontSize: '1.1rem',
            mb: 4,
            opacity: 0.95,
          }}
        >
          Dall'antica Roma al Rinascimento, visitate palazzi e monumenti storici, magnifiche cattedrali e città medievali.
        </Typography>

        {/* Experience Cards */}
        <Grid container spacing={3}>
          {experiences.map((experience, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="250"
                  image={experience.image}
                  alt={experience.title}
                  sx={{
                    objectFit: 'cover',
                  }}
                />
                <CardContent
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    position: 'relative',
                    mt: -8,
                    mx: 2,
                    borderRadius: '0 0 12px 12px',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      py: 2,
                    }}
                  >
                    {experience.title}
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

export default Categories;
