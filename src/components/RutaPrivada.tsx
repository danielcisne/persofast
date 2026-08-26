import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RutaPrivada() {
  const { usuario } = useAuth();

  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
}
