import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Login from './pages/Login';
import RoundsList from './pages/RoundsList';
import RoundDetail from './pages/RoundDetail';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/rounds"
            element={
              <PrivateRoute>
                <RoundsList />
              </PrivateRoute>
            }
          />
          <Route
            path="/rounds/:id"
            element={
              <PrivateRoute>
                <RoundDetail />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/rounds" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
