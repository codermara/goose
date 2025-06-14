import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import axios from 'axios';

interface Round {
  id: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'cooldown' | 'finished';
}

export default function RoundsList() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchRounds = async () => {
    try {
      const response = await axios.get('http://localhost:3000/rounds', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRounds(response.data);
    } catch (error: any) {
      setError('Не удалось загрузить список раундов');
      console.error('Error fetching rounds:', error);
    }
  };

  useEffect(() => {
    fetchRounds();
    const interval = setInterval(fetchRounds, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateRound = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3000/rounds',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      navigate(`/rounds/${response.data.id}`);
    } catch (error: any) {
      setError('Не удалось создать раунд');
      console.error('Error creating round:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'finished':
        return 'error';
      case 'cooldown':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'finished':
        return 'Завершен';
      case 'cooldown':
        return 'Ожидание';
      default:
        return status;
    }
  };

  const getTimeLeft = (round: Round) => {
    const now = Date.now();
    if (round.status === 'cooldown') {
      const timeLeft = Math.max(0, Math.floor((new Date(round.startDate).getTime() - now) / 1000));
      return `До начала: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
    } else if (round.status === 'active') {
      const timeLeft = Math.max(0, Math.floor((new Date(round.endDate).getTime() - now) / 1000));
      return `До конца: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
    }
    return '';
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Раунды
        </Typography>
        {user.role === 'ADMIN' && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateRound}
            sx={{ mb: 2 }}
          >
            Создать новый раунд
          </Button>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <List>
          {rounds.map((round) => (
            <Paper key={round.id} sx={{ mb: 2 }}>
              <ListItem
                button
                onClick={() => navigate(`/rounds/${round.id}`)}
              >
                <ListItemText
                  primary={`Раунд ${round.id.slice(0, 8)}`}
                  secondary={
                    <Box component="div" sx={{ mt: 1 }}>
                      <Chip
                        label={getStatusText(round.status)}
                        color={getStatusColor(round.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography component="div" variant="body2" color="text.secondary">
                        Начало: {new Date(round.startDate).toLocaleString()}
                      </Typography>
                      <Typography component="div" variant="body2" color="text.secondary">
                        Конец: {new Date(round.endDate).toLocaleString()}
                      </Typography>
                      {getTimeLeft(round) && (
                        <Typography 
                          component="div"
                          variant="body2" 
                          color={round.status === 'cooldown' ? 'warning.main' : 'success.main'}
                          sx={{ mt: 0.5 }}
                        >
                          {getTimeLeft(round)}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      </Box>
    </Container>
  );
} 