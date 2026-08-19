// src/components/RutaPrivada.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RutaPrivada() {
  // Escuchamos la radio para ver si hay un usuario
  const { usuario } = useAuth();

  // Si HAY usuario, Outlet lo deja pasar a la pantalla que pidió.
  // Si NO hay usuario, Navigate lo patea de regreso a la pantalla de /login.
  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
}