import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardList, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Solicitud } from '../types';

export default function Dashboard() {
  const { perfil } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [analistasTotal, setAnalistasTotal] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!perfil) return;

    let qSolicitudes = collection(db, 'solicitudes') as any;
    if (perfil.rol === 'Cliente') {
      qSolicitudes = query(collection(db, 'solicitudes'), where('empresa', '==', perfil.empresa));
    }

    const unsubscribeSol = onSnapshot(qSolicitudes, (snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Solicitud[];

      const ordenadas = data.sort((a, b) => (Number(b.folio) || 0) - (Number(a.folio) || 0));
      setSolicitudes(ordenadas);
      setCargando(false);
    });

    let unsubscribeUsu = () => { };
    if (perfil.rol === 'Administrador' || perfil.rol === 'Administracion' || perfil.rol === 'Mesa') {
      const qUsu = query(collection(db, 'usuarios'), where('rol', '==', 'Analista'));
      unsubscribeUsu = onSnapshot(qUsu, (snap) => {
        setAnalistasTotal(snap.size);
      });
    }

    return () => {
      unsubscribeSol();
      unsubscribeUsu();
    };
  }, [perfil]);

  const activos = solicitudes.filter(s => s.estatus !== 'Completado' && s.estatus !== 'Cancelado').length;
  const enProceso = solicitudes.filter(s => ['En Proceso', 'Integración', 'Citado', 'Por Aprobar'].includes(s.estatus)).length;
  const completados = solicitudes.filter(s => s.estatus === 'Completado').length;

  const recientes = solicitudes.slice(0, 5);

  if (cargando) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Cargando métricas...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
        <p className="text-slate-500 mt-1">
          Bienvenido, <span className="font-semibold text-slate-700">{perfil?.nombre}</span>. Aquí tienes el resumen al día de hoy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <ClipboardList size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Estudios Activos</p>
            <h3 className="text-3xl font-black text-slate-800">{activos}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">En Proceso / Integración</p>
            <h3 className="text-3xl font-black text-slate-800">{enProceso}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          {perfil?.rol === 'Cliente' ? (
            <>
              <div className="w-14 h-14 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Estudios Completados</p>
                <h3 className="text-3xl font-black text-slate-800">{completados}</h3>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Analistas en Campo</p>
                <h3 className="text-3xl font-black text-slate-800">{analistasTotal}</h3>
              </div>
            </>
          )}
        </div>

      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Estudios Recientes</h2>
          <Link to="/solicitudes" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>

        {recientes.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <ClipboardList size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No hay estudios recientes</h3>
            <p className="text-slate-500 text-sm mt-1">Comienza creando una nueva solicitud en el módulo correspondiente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-6 py-4">Folio</th>
                  <th className="px-6 py-4">Candidato</th>
                  {perfil?.rol !== 'Cliente' && <th className="px-6 py-4">Empresa</th>}
                  <th className="px-6 py-4">Estatus</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recientes.map((solicitud) => (
                  <tr key={solicitud.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">
                      FOL-{String(solicitud.folio).padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {solicitud.candidato.nombre} {solicitud.candidato.apellidoPaterno}
                    </td>
                    {perfil?.rol !== 'Cliente' && (
                      <td className="px-6 py-4 text-slate-600">{solicitud.empresa}</td>
                    )}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border
                        ${solicitud.estatus === 'Recibido' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          solicitud.estatus === 'Integración' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            solicitud.estatus === 'Por Aprobar' ? 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' :
                              solicitud.estatus === 'Citado' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                solicitud.estatus === 'Completado' ? 'bg-green-100 text-green-700 border-green-200' :
                                  'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {solicitud.estatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/solicitudes/${solicitud.id}`}
                        className="text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Revisar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
