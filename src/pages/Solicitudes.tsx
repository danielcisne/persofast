// src/pages/Solicitudes.tsx
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore'; 
import { db } from '../lib/firebase';
import type { Solicitud } from '../types';
import { Plus, Search, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const { perfil } = useAuth(); 

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      if (!perfil) return; 

      setCargando(true);
      try {
        let consulta;

        // 1. Consulta a Firebase
        if (perfil.rol === 'Cliente') {
          // El cliente solo trae las de su empresa
          consulta = query(
            collection(db, 'solicitudes'), 
            where('empresa', '==', perfil.empresa)
          );
        } else if (perfil.rol === 'Mesa') {
          // Mesa de Control solo necesita ver las solicitudes en Integración
          consulta = query(
            collection(db, 'solicitudes'),
            where('estatus', '==', 'Integración')
          );
        } else {
          // Administrador y Analista traen todas de la base de datos
          consulta = collection(db, 'solicitudes');
        }

        const querySnapshot = await getDocs(consulta);
        let datosLimpios = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Solicitud[];
        
        setSolicitudes(datosLimpios);
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
      } finally {
        setCargando(false);
      }
    };
    
    obtenerSolicitudes();
  }, [perfil]); 

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {perfil?.rol === 'Cliente' ? `Solicitudes de ${perfil.empresa}` : 'Solicitudes de Servicio'}
          </h1>
          <p className="text-slate-500 mt-1">
            {perfil?.rol === 'Mesa' ? 'Mostrando únicamente solicitudes en Integración.' : 'Gestiona y revisa todas las solicitudes en curso.'}
          </p>
        </div>
        
        {(perfil?.rol === 'Cliente' || perfil?.rol === 'Administrador') && (
          <Link to="/solicitudes/nueva" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={20} />
            Nueva Solicitud
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Buscar por candidato o folio..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium">Candidato</th>
                {perfil?.rol !== 'Cliente' && <th className="px-6 py-4 font-medium">Empresa</th>}
                <th className="px-6 py-4 font-medium">Servicio</th>
                <th className="px-6 py-4 font-medium">Estatus</th>
                <th className="px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cargando && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando solicitudes...</td></tr>}
              {!cargando && solicitudes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-slate-300 mb-4" />
                      <p className="text-lg font-medium text-slate-600">
                        {perfil?.rol === 'Mesa' ? 'No hay solicitudes pendientes de Integración' : 'No hay solicitudes registradas'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">
                      {solicitud.candidato.nombre} {solicitud.candidato.apellidoPaterno}
                    </div>
                    <div className="text-xs text-slate-500 font-bold mt-1">
                      FOL-{String(solicitud.folio).padStart(4, '0')}
                    </div>
                  </td>
                  
                  {perfil?.rol !== 'Cliente' && <td className="px-6 py-4 text-slate-600">{solicitud.empresa}</td>}
                  
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{solicitud.servicio}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${solicitud.estatus === 'Recibido' ? 'bg-blue-100 text-blue-700' : 
                        solicitud.estatus === 'Integración' ? 'bg-purple-100 text-purple-700' : 
                        solicitud.estatus === 'Completado' ? 'bg-green-100 text-green-700' : 
                        'bg-amber-100 text-amber-700'}`}>
                      {solicitud.estatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/solicitudes/${solicitud.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                      Ver detalle / Bitácora
                    </Link>
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