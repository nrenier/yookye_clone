
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Divider,
  useTheme
} from '@mui/material';
import {
  Hotel,
  LocationOn,
  Event,
  Euro,
  People,
  Star
} from '@mui/icons-material';

function PackageCard({ package: pkg, onViewDetails }) {
  const theme = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const [day, month, year] = dateString.split('/');
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const getHotelStars = (starRating) => {
    return Array.from({ length: starRating || 0 }, (_, i) => (
      <Star key={i} sx={{ fontSize: 16, color: '#ffd700' }} />
    ));
  };

  const destinations = pkg.destinations || [];
  const hotels = pkg.hotels || {};
  const experiences = pkg.experiences || {};
  const travelers = pkg.original_request?.travelers || {};

  return (
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #c41e3a 100%)`,
          color: 'white',
          p: 3
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Tour {destinations.join(' e ')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn sx={{ fontSize: 18 }} />
          <Typography variant="body2">
            {destinations.join(' • ')}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Hotels Section */}
        {Object.keys(hotels).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Hotel color="primary" />
              Hotel
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(hotels).map(([city, hotel]) => (
                <Grid item xs={12} sm={6} key={city}>
                  <Box sx={{ 
                    p: 2, 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 2,
                    backgroundColor: 'grey.50'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {city}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      {hotel.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      {getHotelStars(hotel.star_rating)}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {hotel.address}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                        €{hotel.daily_prices}/notte
                      </Typography>
                      <Typography variant="caption">
                        {formatDate(hotel.checkin)} - {formatDate(hotel.checkout)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Experiences Section */}
        {Object.keys(experiences).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Esperienze
            </Typography>
            {Object.entries(experiences).map(([city, experience]) => (
              <Box key={city} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'capitalize', mb: 1 }}>
                  {city}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {experience.alias?.[0] || 'Esperienza personalizzata'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {experience.descrizione?.substring(0, 150)}...
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Package Info */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <People color="action" sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  {(travelers.adults || 0) + (travelers.children || 0)} persone
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Event color="action" sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  {pkg.original_request?.dates?.check_in ? formatDate(pkg.original_request.dates.check_in) : 'Date flessibili'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Passions */}
          {pkg.original_request?.passions && pkg.original_request.passions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                I tuoi interessi:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {pkg.original_request.passions.slice(0, 3).map((passion, index) => (
                  <Chip
                    key={index}
                    label={passion}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
                {pkg.original_request.passions.length > 3 && (
                  <Chip
                    label={`+${pkg.original_request.passions.length - 3}`}
                    size="small"
                    variant="outlined"
                    color="default"
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Euro color="primary" />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
              €{pkg.total_price}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              / totale
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => onViewDetails(pkg)}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': { backgroundColor: '#c41e3a' },
            }}
          >
            Visualizza Dettagli
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default PackageCard;
