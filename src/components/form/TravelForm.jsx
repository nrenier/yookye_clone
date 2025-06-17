import {
  Box,
  Typography,
  Container,
  Paper,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Grid,
  Chip,
  useTheme,
} from "@mui/material";
import { useState } from "react";

function TravelForm() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    passions: [],
    specificPlaces: "",
    placesToVisit: "",
    preferredDestinations: "",
    travelPace: "",
    accommodationLevel: "",
    accommodationType: "",
    adults: 1,
    children: 0,
    infants: 0,
    rooms: 1,
    travelerType: "",
    checkIn: "",
    checkOut: "",
    transportationKnown: "",
    arrivalDeparture: "",
    budget: "",
    specialServices: "",
    email: "",
  });

  const passionOptions = [
    "Storia e arte",
    "Siti archeologici",
    "Musei e gallerie",
    "Monumenti e architetture",
    "Food & Wine",
    "Visite alle cantine",
    "Soggiorni nella Wine Country",
    "Corsi di cucina",
    "Vacanze attive",
    "Trekking tour",
    "Tour in e-bike",
    "Tour in bicicletta",
    "Sci/snowboard",
    "Local Life",
    "Salute & Benessere",
  ];

  const handlePassionChange = (passion) => {
    setFormData((prev) => ({
      ...prev,
      passions: prev.passions.includes(passion)
        ? prev.passions.filter((p) => p !== passion)
        : [...prev.passions, passion],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Import API service
      const { travelAPI } = await import("../../services/api");

      // Map frontend field names to backend field names
      const backendFormData = {
        passions: formData.passions,
        specific_places: formData.specificPlaces,
        places_to_visit: formData.placesToVisit,
        preferred_destinations: formData.preferredDestinations,
        travel_pace: formData.travelPace,
        accommodation_level: formData.accommodationLevel,
        accommodation_type: formData.accommodationType,
        adults: formData.adults,
        children: formData.children,
        infants: formData.infants,
        rooms: formData.rooms,
        traveler_type: formData.travelerType,
        check_in: formData.checkIn,
        check_out: formData.checkOut,
        transportation_known: formData.transportationKnown,
        arrival_departure: formData.arrivalDeparture,
        budget: formData.budget,
        special_services: formData.specialServices,
        email: formData.email,
      };

      // Submit form to backend
      const response = await travelAPI.submitForm(backendFormData);

      // Log job ID if available
      if (response.external_job_id) {
        console.log(`🚀 Job ID remoto lanciato: ${response.external_job_id}`);
      }

      // Show success message
      const jobMessage = response.external_job_id 
        ? `\n\nJob ID remoto: ${response.external_job_id}` 
        : '';
      alert(`Richiesta inviata con successo! ${response.next_steps}${jobMessage}`);

      // Reset form
      setFormData({
        passions: [],
        specificPlaces: "",
        placesToVisit: "",
        preferredDestinations: "",
        travelPace: "",
        accommodationLevel: "",
        accommodationType: "",
        adults: 1,
        children: 0,
        infants: 0,
        rooms: 1,
        travelerType: "",
        checkIn: "",
        checkOut: "",
        transportationKnown: "",
        arrivalDeparture: "",
        budget: "",
        specialServices: "",
        email: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Errore nell'invio del form: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 6, backgroundColor: "#f9f8fb", minHeight: "100vh" }}>
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 3,
            backgroundColor: "white",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: 700,
              color: theme.palette.secondary.main,
              mb: 6,
            }}
          >
            Configura il tuo viaggio
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Passions Section */}
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h5"
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  mb: 3,
                }}
              >
                Le tue passioni:
              </Typography>

              <Grid container spacing={2}>
                {passionOptions.map((passion) => (
                  <Grid item xs={12} sm={6} md={4} key={passion}>
                    <Chip
                      label={passion}
                      clickable
                      variant={
                        formData.passions.includes(passion)
                          ? "filled"
                          : "outlined"
                      }
                      color={
                        formData.passions.includes(passion)
                          ? "primary"
                          : "default"
                      }
                      onClick={() => handlePassionChange(passion)}
                      sx={{
                        width: "100%",
                        height: "auto",
                        py: 1,
                        "& .MuiChip-label": {
                          whiteSpace: "normal",
                          lineHeight: 1.2,
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Specific Places */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset">
                <FormLabel
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: theme.palette.secondary.main,
                    mb: 2,
                  }}
                >
                  Hai dei luoghi da non perdere?
                </FormLabel>
                <RadioGroup
                  value={formData.specificPlaces}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      specificPlaces: e.target.value,
                    }))
                  }
                >
                  <FormControlLabel
                    value="no"
                    control={<Radio />}
                    label="No, sono aperto alle vostre proposte"
                  />
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Sì, ho alcune Città/Regioni che voglio assolutamente vedere"
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            {formData.specificPlaces === "yes" && (
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label="Specifica i luoghi che vuoi visitare"
                  multiline
                  rows={3}
                  value={formData.placesToVisit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      placesToVisit: e.target.value,
                    }))
                  }
                  sx={{ mb: 2 }}
                />
              </Box>
            )}

            {/* Travel Preferences */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset">
                <FormLabel
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: theme.palette.secondary.main,
                    mb: 2,
                  }}
                >
                  Mete clou o luoghi fuori dagli itinerari più popolari: cosa
                  preferite?
                </FormLabel>
                <RadioGroup
                  value={formData.preferredDestinations}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredDestinations: e.target.value,
                    }))
                  }
                >
                  <FormControlLabel
                    value="popular"
                    control={<Radio />}
                    label="Voglio vivere le mete di maggior interesse: destinazioni popolari"
                  />
                  <FormControlLabel
                    value="offbeat"
                    control={<Radio />}
                    label="Voglio sperimentare ciò che l'Italia ha da offrire al riparo dalla folla"
                  />
                  <FormControlLabel
                    value="both"
                    control={<Radio />}
                    label="Sono aperto a entrambe le opzioni"
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Travel Pace */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset">
                <FormLabel
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: theme.palette.secondary.main,
                    mb: 2,
                  }}
                >
                  Quale di questi descrive il ritmo ideale per il tuo viaggio?
                </FormLabel>
                <RadioGroup
                  value={formData.travelPace}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      travelPace: e.target.value,
                    }))
                  }
                >
                  <FormControlLabel
                    value="fast"
                    control={<Radio />}
                    label="Veloce: vedere il più possibile, 1-2 notti per località"
                  />
                  <FormControlLabel
                    value="moderate"
                    control={<Radio />}
                    label="Moderato: mix di soggiorni, 2-3 notti per località"
                  />
                  <FormControlLabel
                    value="relaxed"
                    control={<Radio />}
                    label="Rilassato: poche destinazioni, 3-4 notti per località"
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Accommodation Level */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset">
                <FormLabel
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: theme.palette.secondary.main,
                    mb: 2,
                  }}
                >
                  Quale è il livello di sistemazione che preferisci?
                </FormLabel>
                <RadioGroup
                  value={formData.accommodationLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accommodationLevel: e.target.value,
                    }))
                  }
                >
                  <FormControlLabel
                    value="mid"
                    control={<Radio />}
                    label="Sistemazioni di fascia media, accoglienti e ben posizionate"
                  />
                  <FormControlLabel
                    value="boutique"
                    control={<Radio />}
                    label="Boutique: affascinanti e confortevoli con servizi di buon livello"
                  />
                  <FormControlLabel
                    value="luxury"
                    control={<Radio />}
                    label="Sistemazioni eleganti e lussuose, con servizi di alto livello"
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Accommodation Type */}
            <Box sx={{ mb: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Tipologia di sistemazione ideale</InputLabel>
                <Select
                  value={formData.accommodationType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accommodationType: e.target.value,
                    }))
                  }
                  label="Tipologia di sistemazione ideale"
                >
                  <MenuItem value="hotel">Hotel</MenuItem>
                  <MenuItem value="bnb">B&B</MenuItem>
                  <MenuItem value="agriturismo">Agriturismo</MenuItem>
                  <MenuItem value="villa">Villa</MenuItem>
                  <MenuItem value="appartamento">Appartamento</MenuItem>
                  <MenuItem value="glamping">Glamping</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Travelers Details */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: theme.palette.secondary.main,
                  mb: 3,
                }}
              >
                Numero di viaggiatori
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Adulti"
                    value={formData.adults}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adults: parseInt(e.target.value) || 0,
                      }))
                    }
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Bambini (3-12 anni)"
                    value={formData.children}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        children: parseInt(e.target.value) || 0,
                      }))
                    }
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Neonati (0-2 anni)"
                    value={formData.infants}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        infants: parseInt(e.target.value) || 0,
                      }))
                    }
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Camere"
                    value={formData.rooms}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rooms: parseInt(e.target.value) || 1,
                      }))
                    }
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Traveler Type */}
            <Box sx={{ mb: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Tipologia di viaggiatore</InputLabel>
                <Select
                  value={formData.travelerType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      travelerType: e.target.value,
                    }))
                  }
                  label="Tipologia di viaggiatore"
                >
                  <MenuItem value="famiglia">Famiglia</MenuItem>
                  <MenuItem value="coppia">Coppia</MenuItem>
                  <MenuItem value="amici">Gruppo di amici</MenuItem>
                  <MenuItem value="azienda">Azienda</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Period */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: theme.palette.secondary.main,
                  mb: 3,
                }}
              >
                Periodo:
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Check-in"
                    value={formData.checkIn}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        checkIn: e.target.value,
                      }))
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Check-out"
                    value={formData.checkOut}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        checkOut: e.target.value,
                      }))
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Transportation */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset">
                <FormLabel
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: theme.palette.secondary.main,
                    mb: 2,
                  }}
                >
                  Conosci già le località di arrivo e partenza per questo
                  viaggio?
                </FormLabel>
                <RadioGroup
                  value={formData.transportationKnown}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      transportationKnown: e.target.value,
                    }))
                  }
                >
                  <FormControlLabel
                    value="no"
                    control={<Radio />}
                    label="Non so ancora"
                  />
                  <FormControlLabel
                    value="car"
                    control={<Radio />}
                    label="Userò la mia auto"
                  />
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Sì, conosco già le località di arrivo e partenza (volo/treno)"
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            {formData.transportationKnown === "yes" && (
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label="Località di arrivo e partenza"
                  multiline
                  rows={2}
                  value={formData.arrivalDeparture}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      arrivalDeparture: e.target.value,
                    }))
                  }
                  placeholder="Specifica le località di arrivo e partenza..."
                />
              </Box>
            )}

            {/* Budget */}
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset">
                <FormLabel
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: theme.palette.secondary.main,
                    mb: 2,
                  }}
                >
                  Hai in mente un budget specifico per questo viaggio?
                </FormLabel>
                <RadioGroup
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, budget: e.target.value }))
                  }
                >
                  <FormControlLabel
                    value="budget"
                    control={<Radio />}
                    label="Budget, meno di € 150 a persona/giorno"
                  />
                  <FormControlLabel
                    value="midrange"
                    control={<Radio />}
                    label="Mid-range, tra € 150 - € 250 a persona/giorno"
                  />
                  <FormControlLabel
                    value="comfort"
                    control={<Radio />}
                    label="Comfort, tra € 250 - € 400 a persona/giorno"
                  />
                  <FormControlLabel
                    value="luxury"
                    control={<Radio />}
                    label="Lusso, > € 400 a persona/giorno"
                  />
                  <FormControlLabel
                    value="no-budget"
                    control={<Radio />}
                    label="Non ho un budget specifico in mente"
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Special Services */}
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Servizi speciali / Esigenze particolari"
                multiline
                rows={4}
                value={formData.specialServices}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specialServices: e.target.value,
                  }))
                }
                placeholder="Descrivi eventuali esigenze particolari, servizi speciali richiesti, accessibilità, allergie alimentari, etc..."
              />
            </Box>

            {/* Email */}
            <Box sx={{ mb: 6 }}>
              <TextField
                fullWidth
                required
                type="email"
                label="E-mail"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                helperText="Riceverai le proposte degli Esperti Locali via email"
              />
            </Box>

            {/* Submit Button */}
            <Box sx={{ textAlign: "center" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  px: 6,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  borderRadius: "30px",
                  textTransform: "none",
                  boxShadow: "0 8px 30px rgba(219, 33, 63, 0.3)",
                  "&:hover": {
                    backgroundColor: "#c41e3a",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 40px rgba(219, 33, 63, 0.4)",
                  },
                  "&:disabled": {
                    backgroundColor: "#ccc",
                    transform: "none",
                    boxShadow: "none",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? "Invio in corso..." : "Invia Richiesta"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default TravelForm;
