
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Button
} from '@mui/material';
import { CheckCircle, Error, Search, Schedule } from '@mui/icons-material';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { travelAPI } from '../services/api';

const LoadingPage = ({ user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('PROCESSING');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [jobId, setJobId] = useState('');
  const [pollingCount, setPollingCount] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Get job ID from location state or URL params
    const searchParams = new URLSearchParams(location.search);
    const jobIdFromParams = searchParams.get('jobId');
    const jobIdFromState = location.state?.jobId;
    const currentJobId = jobIdFromParams || jobIdFromState;

    if (!currentJobId) {
      setError('Job ID non trovato. Torna al modulo e riprova.');
      return;
    }

    setJobId(currentJobId);
    startPolling(currentJobId);
  }, [location]);

  const startPolling = (jobId) => {
    console.log(`[DEBUG] Starting polling for job: ${jobId}`);
    
    const pollInterval = setInterval(async () => {
      try {
        console.log(`[DEBUG] Polling attempt ${pollingCount + 1} for job: ${jobId}`);
        setPollingCount(prev => prev + 1);
        
        const statusResponse = await travelAPI.pollJobStatus(jobId);
        console.log('[DEBUG] Status response:', statusResponse);
        
        const jobStatus = statusResponse.status || statusResponse.state || 'PROCESSING';
        setStatus(jobStatus);
        
        // Update progress based on status
        switch (jobStatus) {
          case 'PROCESSING':
          case 'RUNNING':
            setProgress(prev => Math.min(prev + 5, 90));
            break;
          case 'COMPLETED':
            setProgress(100);
            clearInterval(pollInterval);
            await getJobResult(jobId);
            break;
          case 'FAILED':
          case 'ERROR':
            setProgress(100);
            setError('Il processo di ricerca è fallito. Riprova più tardi.');
            clearInterval(pollInterval);
            break;
          default:
            setProgress(prev => Math.min(prev + 2, 85));
        }
        
        // Stop polling after 20 attempts (5 minutes)
        if (pollingCount >= 20) {
          clearInterval(pollInterval);
          setError('Timeout: il processo sta impiegando più tempo del previsto. Riprova più tardi.');
        }
        
      } catch (error) {
        console.error('[ERROR] Polling failed:', error);
        setError(`Errore durante il controllo dello stato: ${error.message}`);
        clearInterval(pollInterval);
      }
    }, 15000); // Poll every 15 seconds

    // Initial poll
    setTimeout(async () => {
      try {
        const statusResponse = await travelAPI.pollJobStatus(jobId);
        const jobStatus = statusResponse.status || statusResponse.state || 'PROCESSING';
        setStatus(jobStatus);
        setProgress(20);
      } catch (error) {
        console.error('[ERROR] Initial poll failed:', error);
        setError(`Errore durante il controllo iniziale: ${error.message}`);
      }
    }, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  };

  const getJobResult = async (jobId) => {
    try {
      console.log(`[DEBUG] Getting result for job: ${jobId}`);
      const resultResponse = await travelAPI.getJobResult(jobId);
      console.log('[INFO] Job result received:', resultResponse);
      console.log('[DEBUG] Packages should be saved to database now...');
      setResult(resultResponse);
      setStatus('COMPLETED');
      
      // Wait a bit longer to ensure packages are saved
      setTimeout(() => {
        console.log('[DEBUG] Redirecting to profile packages section...');
        navigate('/profile', { state: { activeSection: 'packages' } });
      }, 5000);
    } catch (error) {
      console.error('[ERROR] Failed to get job result:', error);
      setError(`Errore durante il recupero del risultato: ${error.message}`);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />;
      case 'FAILED':
      case 'ERROR':
        return <Error sx={{ fontSize: 48, color: 'error.main' }} />;
      default:
        return <Search sx={{ fontSize: 48, color: 'primary.main' }} />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'PROCESSING':
      case 'RUNNING':
        return 'Il nostro esperto virtuale sta analizzando le tue preferenze...';
      case 'COMPLETED':
        return 'Ricerca completata! Proposte personalizzate trovate.';
      case 'FAILED':
      case 'ERROR':
        return 'Si è verificato un errore durante la ricerca.';
      default:
        return 'Preparazione della ricerca in corso...';
    }
  };

  const handleBackToForm = () => {
    navigate('/form');
  };

  const handleViewResults = () => {
    // Navigate to results page or show results
    if (result) {
      // For now, just log the result and redirect to profile
      console.log('[INFO] Navigating to results with data:', result);
      navigate('/profile', { state: { travelResults: result } });
    }
  };

  return (
    <Box>
      <Header user={user} setUser={setUser} />
      <Container maxWidth="md" sx={{ py: 8, minHeight: '80vh' }}>
        <Card elevation={3} sx={{ textAlign: 'center', p: 4 }}>
          <CardContent>
            {/* Status Icon */}
            <Box sx={{ mb: 4 }}>
              {getStatusIcon()}
            </Box>

            {/* Title */}
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              {status === 'COMPLETED' ? 'Ricerca Completata!' : 'Ricerca in Corso...'}
            </Typography>

            {/* Status Message */}
            <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
              {getStatusMessage()}
            </Typography>

            {/* Progress Bar */}
            {status !== 'COMPLETED' && status !== 'FAILED' && status !== 'ERROR' && (
              <Box sx={{ mb: 4 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progress)}% completato
                </Typography>
              </Box>
            )}

            {/* Loading Spinner */}
            {status !== 'COMPLETED' && status !== 'FAILED' && status !== 'ERROR' && (
              <Box sx={{ mb: 4 }}>
                <CircularProgress size={60} thickness={4} />
              </Box>
            )}

            {/* Polling Info */}
            {status !== 'COMPLETED' && status !== 'FAILED' && status !== 'ERROR' && (
              <Box sx={{ mb: 4, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Schedule sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Controllo automatico ogni 15 secondi
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Tentativi: {pollingCount} | Job ID: {jobId}
                </Typography>
              </Box>
            )}

            {/* Error Display */}
            {error && (
              <Alert severity="error" sx={{ mb: 4, textAlign: 'left' }}>
                {error}
              </Alert>
            )}

            {/* Success Result */}
            {status === 'COMPLETED' && result && (
              <Box sx={{ mb: 4 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Abbiamo trovato le proposte perfette per il tuo viaggio!
                </Alert>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleViewResults}
                  sx={{ mr: 2 }}
                >
                  Visualizza Risultati
                </Button>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleBackToForm}
                size="large"
              >
                Torna al Modulo
              </Button>
            </Box>

            {/* Additional Info */}
            <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
              Il nostro sistema utilizza intelligenza artificiale per analizzare le tue preferenze
              e trovare le migliori proposte di viaggio personalizzate.
            </Typography>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </Box>
  );
};

export default LoadingPage;
