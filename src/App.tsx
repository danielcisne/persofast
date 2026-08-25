// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; 
import RutaPrivada from './components/RutaPrivada';  
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Solicitudes from './pages/Solicitudes';         
import NuevaSolicitud from './pages/NuevaSolicitud';   
import SolicitudDetalle from './pages/SolicitudDetalle';
import Login from './pages/Login'; 
import Equipo from './pages/Equipo';
import CapturaEstudio from './pages/CapturaEstudio';
import ValidacionEstudio from './pages/ValidacionEstudio';

function App() {
  return (
    
    <AuthProvider>
      <Router>
        <Routes>
         
          <Route path="/login" element={<Login />} />

         
          <Route element={<RutaPrivada />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/solicitudes" element={<Solicitudes />} />                 
              <Route path="/solicitudes/nueva" element={<NuevaSolicitud />} />        
              <Route path="/solicitudes/:id" element={<SolicitudDetalle />} />
              <Route path="/equipo" element={<Equipo />} />
              <Route path="/solicitudes/:id/captura" element={<CapturaEstudio />} />  
              <Route path="/solicitudes/:id/validacion" element={<ValidacionEstudio />} />      
            </Route>
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
