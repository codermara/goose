import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Chip,
} from '@mui/material';
import axios from 'axios';

interface Round {
  id: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'cooldown' | 'finished';
  tapsByUser: Record<string, { username: string; points: number }>;
  winner: { username: string; points: number } | null;
}

export default function RoundDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [round, setRound] = useState<Round | null>(null);
  const [error, setError] = useState('');
  const [isTapping, setIsTapping] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchRound = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/rounds/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRound(response.data);
    } catch (error: any) {
      setError('Failed to fetch round details');
      console.error('Error fetching round:', error);
    }
  };

  useEffect(() => {
    fetchRound();
    const interval = setInterval(fetchRound, 1000);
    return () => clearInterval(interval);
  }, [id]);

  const handleTap = async () => {
    if (!round || round.status !== 'active' || isTapping) return;

    setIsTapping(true);
    try {
      await axios.post(
        `http://localhost:3000/taps/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      await fetchRound();
    } catch (error: any) {
      setError('Failed to tap the goose');
      console.error('Error tapping goose:', error);
    } finally {
      setIsTapping(false);
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

  if (!round) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  const userPoints = round.tapsByUser[user.id]?.points || 0;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/rounds')}
          sx={{ mb: 2 }}
        >
          Назад к раундам
        </Button>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Раунд {round.id.slice(0, 8)}
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Chip
              label={getStatusText(round.status)}
              color={getStatusColor(round.status)}
              sx={{ mr: 2 }}
            />
            <Typography variant="body1" sx={{ mt: 1 }}>
              Начало: {new Date(round.startDate).toLocaleString()}
            </Typography>
            <Typography variant="body1">
              Конец: {new Date(round.endDate).toLocaleString()}
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Ваши очки: {userPoints}
            </Typography>
          </Box>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px',
              cursor: round.status === 'active' ? 'pointer' : 'default',
              opacity: round.status === 'active' ? 1 : 0.5,
              transition: 'transform 0.1s',
              '&:active': round.status === 'active' ? {
                transform: 'scale(0.95)',
              } : {},
            }}
            onMouseDown={(e) => {
              if (e.button === 0 && round.status === 'active') { // 0 is left mouse button
                handleTap();
              }
            }}
          >
            <Typography variant="h1" sx={{ userSelect: 'none', fontSize: '8rem' }}>
              🦢
            </Typography>
          </Box>

          <Paper sx={{ p: 2, mb: 2, mt: 4 }}>
            <Typography variant="h6">
              Ваши очки: {userPoints}
            </Typography>
          </Paper>

          {round.winner && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'success.light' }}>
              <Typography variant="h6">
                Победитель: {round.winner.username} с {round.winner.points} очками!
              </Typography>
            </Paper>
          )}

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Таблица лидеров
            </Typography>
            {Object.entries(round.tapsByUser)
              .sort(([, a], [, b]) => b.points - a.points)
              .map(([userId, data], index) => (
                <Typography key={userId} sx={{ 
                  color: userId === user.id ? 'primary.main' : 'inherit',
                  fontWeight: userId === user.id ? 'bold' : 'normal',
                }}>
                  {index + 1}. {data.username}: {data.points} очков
                </Typography>
              ))}
          </Paper>
        </Paper>
      </Box>
    </Container>
  );
} 