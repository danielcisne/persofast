import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { PerfilUsuario } from '../types';
import { Plus, Shield, User, Briefcase, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Equipo() {
  const [usuarios, setUsuarios] = useState<PerfilUsuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const { perfil } = useAuth(); // Para saber si el que ve esto es el Admin

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'usuarios'));
        const datosLimpios = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as PerfilUsuario[];
        setUsuarios(datosLimpios);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerUsuarios();
  }, []);

  const getIconoRol = (rol: string) => {
    switch (rol) {
      case 'Administrador': return <Shield size={16} className="text-purple-600" />;
      case 'Analista': return <Briefcase size={16} className="text-blue-600" />;
      case 'Cliente': return <Building size={16} className="text-emerald-600" />;
      default: return <User size={16} className="text-slate-600" />;
    }
  };

  if (perfil?.rol !== 'Administrador') {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full">
        <Shield size={64} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700">Acceso Restringido</h2>
        <p className="text-slate-500 mt-2">Solo los Administradores pueden ver y gestionar el equipo.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Usuarios</h1>
          <p className="text-slate-500 mt-1">Administra los accesos de tu equipo y clientes.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium">Nombre / Empresa</th>
                <th className="px-6 py-4 font-medium">Correo Electrónico</th>
                <th className="px-6 py-4 font-medium">Rol del Sistema</th>
                <th className="px-6 py-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cargando && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Cargando equipo...</td></tr>}
              
              {usuarios.map((usr) => (
                <tr key={usr.uid} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{usr.nombre}</div>
                    {usr.empresa && <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Building size={12}/> {usr.empresa}</div>}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{usr.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {getIconoRol(usr.rol)}
                      {usr.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">Activo</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
