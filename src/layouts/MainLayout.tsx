import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

import logoPersofast from '../assets/PersofastSecuritasLogoGem.png';

export default function MainLayout() {
  const { perfil } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error al salir:", error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center justify-center px-4 border-b border-slate-800 bg-slate-900">
           <div className="bg-white p-1 rounded w-full flex justify-center">
             <img src={logoPersofast} alt="Logo Persofast Securitas" className="h-8 object-contain" />
           </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          
          <NavLink to="/solicitudes" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <FileText size={20} /> Solicitudes
          </NavLink>

          {perfil?.rol === 'Administrador' && (
            <NavLink to="/equipo" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
              <Users size={20} /> Equipo
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <UserCircle size={36} className="text-blue-500" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{perfil?.nombre || 'Usuario'}</p>
              <p className="text-xs text-slate-400 truncate">{perfil?.rol || 'Cargando rol...'}</p>
            </div>
          </div>
          
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg hover:bg-slate-800 hover:text-red-400 transition-colors text-sm">
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet /> 
      </main>
    </div>
  );
}
