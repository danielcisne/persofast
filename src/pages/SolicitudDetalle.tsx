// src/pages/SolicitudDetalle.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, writeBatch, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  ArrowLeft, MapPin, User, Building, FileText,
  CheckCircle2, Clock, CalendarDays, CalendarCheck, Edit3,
  DownloadCloud, FileCheck2, ShieldCheck
} from 'lucide-react';
import type { Solicitud, EntradaBitacora } from '../types';
import { useAuth } from '../contexts/AuthContext';

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import ReportePDF from '../components/pdf/ReportePDF';

export default function SolicitudDetalle() {
  const { id } = useParams<{ id: string }>();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [cargando, setCargando] = useState(true);
  const [resultado, setResultado] = useState('');

  const { perfil, usuario } = useAuth();

  const [fechaCita, setFechaCita] = useState('');
  const [horaCita, setHoraCita] = useState('');
  const [guardandoCita, setGuardandoCita] = useState(false);

  const [bitacora, setBitacora] = useState<EntradaBitacora[]>([]);
  const [procesandoAprobacion, setProcesandoAprobacion] = useState(false);

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, 'solicitudes', id);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const datos = docSnap.data() as Solicitud;
        setSolicitud({ ...datos, id: docSnap.id });
        if (datos.cita) {
          setFechaCita(datos.cita.fecha);
          setHoraCita(datos.cita.hora);
        }
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, 'solicitudes', id, 'bitacora'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EntradaBitacora[];
      setBitacora(logs);
    });
    return () => unsubscribe();
  }, [id]);

  const handleSaveAppointment = useCallback(async () => {
    if (!id || !perfil || !usuario || !fechaCita || !horaCita) {
      alert('Por favor, completa fecha y hora.');
      return;
    }
    setGuardandoCita(true);
    try {
      const batch = writeBatch(db);
      const fechaAgendado = new Date().toISOString();

      const docRef = doc(db, 'solicitudes', id);
      batch.update(docRef, {
        estatus: 'Citado',
        cita: { fecha: fechaCita, hora: horaCita, quienAgendo: perfil.nombre, cuandoAgendo: fechaAgendado }
      });

      const bitacoraRef = doc(collection(db, 'solicitudes', id, 'bitacora'));
      batch.set(bitacoraRef, {
        fecha: fechaAgendado,
        accion: `Se agendó la visita para el día ${fechaCita} a las ${horaCita}`,
        usuarioId: usuario.uid,
        nombreUsuario: perfil.nombre
      });

      await batch.commit();
      alert('Cita agendada.');
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setGuardandoCita(false);
    }
  }, [id, perfil, usuario, fechaCita, horaCita]);

  const handleAprobarEstudio = async () => {
    if (!id || !usuario || !perfil) return;
    const confirmacion = window.confirm(`¿Estás seguro de Aprobar este estudio como ${resultado}? Se enviará la notificación por correo al cliente y el estatus cambiará a 'Completado'.`);
    if (!confirmacion) return;

    setProcesandoAprobacion(true);
    try {
      const batch = writeBatch(db);

      // 1. Actualizar estatus
      const docRef = doc(db, 'solicitudes', id);
      batch.update(docRef, { 
        estatus: 'Completado',
        resultadoValidacion: resultado
      });

      // 2. Guardar en Bitácora
      const bitacoraRef = doc(collection(db, 'solicitudes', id, 'bitacora'));
      batch.set(bitacoraRef, {
        fecha: new Date().toISOString(),
        accion: `El Administrador aprobó el reporte con estatus '${resultado}'. Notificación enviada al cliente.`,
        usuarioId: usuario.uid,
        nombreUsuario: perfil.nombre
      });

      const folioFormateado = solicitud?.folio ? `FOL-${String(solicitud.folio).padStart(4, '0')}` : id;

      // 3. Correo Interno para ustedes (opcional)
      const mailAdminRef = doc(collection(db, 'mail'));
      batch.set(mailAdminRef, {
        to: ['notificaciones@persofast.com'],
        message: {
          subject: `✅ Reporte Aprobado (Interno) - ${solicitud?.candidato.nombre} ${solicitud?.candidato.apellidoPaterno}`,
          html: `<p>El reporte <b>${folioFormateado}</b> ha sido marcado como Completado con estatus '${resultado}' por ${perfil.nombre}.</p>`
        }
      });

      // 🔥 4. NUEVO: Correo Elegante para el Cliente
      if (solicitud?.clienteEmail) {
        const mailClienteRef = doc(collection(db, 'mail'));
        const colorStatus = resultado === 'No Recomendable' ? '#ef4444' : resultado === 'Con Reservas' ? '#f59e0b' : '#16a34a';
        batch.set(mailClienteRef, {
          to: solicitud.clienteEmail,
          message: {
            subject: `✅ Estudio Finalizado: ${folioFormateado} - ${solicitud.candidato.nombre} ${solicitud.candidato.apellidoPaterno}`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
                  <h2 style="margin: 0;">Reporte Socioeconómico Listo</h2>
                </div>
                <div style="padding: 30px;">
                  <p>Hola,</p>
                  <p>Te informamos que el estudio socioeconómico para el candidato <b>${solicitud.candidato.nombre} ${solicitud.candidato.apellidoPaterno}</b> ha sido completado y aprobado exitosamente.</p>
                  
                  <div style="background-color: #f8fafc; border-left: 4px solid ${colorStatus}; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;">El estatus final de validación es: <strong style="color: ${colorStatus}; text-transform: uppercase;">${resultado}</strong>.</p>
                  </div>

                  <p>Por favor, ingresa a tu panel de control en Persofast para revisar los detalles y <b>descargar el reporte PDF</b>.</p>
                  
                  <p style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                    <a href="${window.location.origin}/solicitudes/${id}" style="background-color: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Ver y Descargar Reporte</a>
                  </p>
                </div>
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e5e7eb;">
                  Atentamente,<br/><b>El equipo de Persofast Securitas</b>
                </div>
              </div>
            `
          }
        });
      }

      await batch.commit();
      alert("¡Estudio aprobado y notificado al cliente con éxito!");
    } catch (error) {
      console.error("Error al aprobar:", error);
      alert("Hubo un error al aprobar el estudio.");
    } finally {
      setProcesandoAprobacion(false);
    }
  };

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando expediente...</div>;
  if (!solicitud) return <div className="p-8 text-center text-red-500">Solicitud no encontrada.</div>;

  const isAdminOrAdminArea = perfil?.rol === 'Administrador' || perfil?.rol === 'Administracion';

  return (
    <div className="p-8 max-w-[1500px] mx-auto pb-20">
      <Link to="/solicitudes" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft size={20} />
        Volver a la lista
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            {solicitud.candidato.nombre} {solicitud.candidato.apellidoPaterno} {solicitud.candidato.apellidoMaterno}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-slate-500">
            <span className="flex items-center gap-1"><Building size={16} /> {solicitud.empresa}</span>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-bold text-blue-600">
              Folio: {solicitud.folio ? `FOL-${String(solicitud.folio).padStart(4, '0')}` : solicitud.id}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border text-center
            ${solicitud.estatus === 'Recibido' ? 'bg-blue-100 text-blue-700 border-blue-200' :
              solicitud.estatus === 'Integración' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                solicitud.estatus === 'Por Aprobar' ? 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 shadow-sm animate-pulse' :
                  solicitud.estatus === 'Citado' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    solicitud.estatus === 'Completado' ? 'bg-green-100 text-green-700 border-green-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'}`}>
            {solicitud.estatus}
          </span>

          <div className="flex items-center gap-2">

            {(perfil?.rol === 'Analista' || isAdminOrAdminArea) && solicitud.estatus !== 'Completado' && (
              <Link to={`/solicitudes/${id}/captura`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm">
                <Edit3 size={18} /> Capturar Estudio
              </Link>
            )}

            {(perfil?.rol === 'Mesa' || isAdminOrAdminArea) && solicitud.estatus !== 'Completado' && (
              <Link to={`/solicitudes/${id}/validacion`} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm">
                <CheckCircle2 size={18} /> Auditoría / Mesa
              </Link>
            )}

            {isAdminOrAdminArea && solicitud.estatus === 'Por Aprobar' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-100 p-2.5 rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Status:</label>
                  <select
                    value={resultado}
                    onChange={(e) => setResultado(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 text-sm font-semibold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Recomendable">Recomendable</option>
                    <option value="No Recomendable">No Recomendable</option>
                    <option value="Con Reservas">Con Reservas</option>
                  </select>
                </div>
                
                <button
                  onClick={handleAprobarEstudio}
                  disabled={!resultado || procesandoAprobacion}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                >
                  <ShieldCheck size={18} />
                  {procesandoAprobacion ? 'Aprobando...' : 'Aprobar Estudio y Notificar'}
                </button>
              </div>
            )}

            {solicitud.estatus === 'Completado' && (
              <PDFDownloadLink
                document={<ReportePDF solicitud={solicitud} />}
                fileName={`Estudio_${solicitud.candidato.nombre}.pdf`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                {/* @ts-ignore */}
                {({ loading }) => (
                  <>{loading ? 'Generando PDF...' : <><DownloadCloud size={18} /> Descargar Reporte PDF</>}</>
                )}
              </PDFDownloadLink>
            )}

          </div>
        </div>
      </div>

      {(solicitud.estatus === 'Por Aprobar' || solicitud.estatus === 'Completado') && (
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-slate-200 p-6 overflow-hidden">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileCheck2 size={24} className={solicitud.estatus === 'Por Aprobar' ? 'text-fuchsia-600' : 'text-emerald-600'} />
            Vista Previa del Reporte Final
          </h2>
          {solicitud.estatus === 'Por Aprobar' && (
            <div className="bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-800 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
              🔔 Este reporte está pendiente de aprobación. Revisa el documento en el visor de abajo y haz clic en "Aprobar Estudio y Notificar" si todo es correcto.
            </div>
          )}
          <div className="w-full h-[800px] rounded-lg border border-slate-300 overflow-hidden bg-slate-50">
            <PDFViewer width="100%" height="100%" showToolbar={true} key={JSON.stringify({ ...solicitud.captura, resultado })}>
              <ReportePDF solicitud={{ ...solicitud, resultadoValidacion: resultado || solicitud.resultadoValidacion }} />
            </PDFViewer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" /> Datos del Servicio
            </h2>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div><p className="text-slate-500 mb-1">Servicio Solicitado</p><p className="font-medium text-slate-800">{solicitud.servicio}</p></div>
              <div><p className="text-slate-500 mb-1">Puesto Solicitado</p><p className="font-medium text-slate-800">{solicitud.puestoSolicitado || 'No especificado'}</p></div>
              <div><p className="text-slate-500 mb-1">Celular</p><p className="font-medium text-slate-800">{solicitud.candidato.celular || 'N/A'}</p></div>
              <div><p className="text-slate-500 mb-1">Teléfono Casa</p><p className="font-medium text-slate-800">{solicitud.candidato.telefonoCasa || 'N/A'}</p></div>
              <div className="col-span-2"><p className="text-slate-500 mb-1">Correo Electrónico</p><p className="font-medium text-slate-800">{solicitud.candidato.correo || 'N/A'}</p></div>
              <div className="col-span-2"><p className="text-slate-500 mb-1">Dirección</p><p className="font-medium text-slate-800">{solicitud.candidato.direccion || 'No especificada'}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-emerald-600" /> Ubicación en Mapa
            </h2>
            <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 relative h-[300px]">
              {solicitud.candidato.direccion ? (
                import.meta.env.VITE_MAPS_API_KEY ? (
                  <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_MAPS_API_KEY}&q=${encodeURIComponent(solicitud.candidato.direccion)}`}
                  ></iframe>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-slate-200 text-slate-500 p-6 text-center border-2 border-dashed border-emerald-400 m-2 rounded">
                    <MapPin size={48} className="text-emerald-600 mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Google Maps Embed</h3>
                    <p className="text-sm text-slate-600 mb-4">Falta VITE_MAPS_API_KEY en .env</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <MapPin size={40} className="text-slate-300 mb-2" />
                  <p>La dirección no fue proporcionada.</p>
                </div>
              )}
            </div>
          </div>

          {(perfil?.rol === 'Analista' || isAdminOrAdminArea) && solicitud.estatus !== 'Completado' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <CalendarDays size={20} className="text-amber-600" /> Gestión de Cita
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de la Visita</label>
                  <input type="date" value={fechaCita} onChange={(e) => setFechaCita(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora de la Visita</label>
                  <input type="time" value={horaCita} onChange={(e) => setHoraCita(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none" />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button onClick={handleSaveAppointment} disabled={guardandoCita} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2">
                    <CalendarCheck size={18} /> {guardandoCita ? 'Guardando...' : 'Guardar Cita'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {perfil?.rol !== 'Analista' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock size={20} className="text-blue-600" /> Bitácora de Progreso
              </h2>
              <div className="relative border-l-2 border-blue-200 ml-4 space-y-8 pb-4">
                {bitacora.length === 0 ? (
                  <div className="relative pl-6">
                    <span className="absolute -left-[11px] top-1 bg-white rounded-full"><CheckCircle2 size={20} className="text-slate-300" /></span>
                    <p className="text-sm text-slate-500 mt-1">Esperando a que inicie el proceso...</p>
                  </div>
                ) : (
                  bitacora.map((log: EntradaBitacora, index: number) => (
                    <div key={log.id} className="relative pl-6 animate-fadeIn">
                      {index === 0 ? (
                        <span className="absolute -left-[11px] top-1 bg-white rounded-full"><CheckCircle2 size={20} className="text-blue-600" /></span>
                      ) : (
                        <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-200 border-2 border-white"></span>
                      )}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                        <h3 className="font-semibold text-slate-800">{log.accion}</h3>
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(log.fecha).toLocaleDateString()} {new Date(log.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Por: {log.nombreUsuario}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-amber-600" /> Documento Adjunto (CV)
            </h2>
            <div className="p-2 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50 flex flex-col items-center justify-center min-h-[300px]">
              {solicitud.cvUrl ? (
                <div className="w-full">
                  <div className="mb-4 flex justify-end">
                    <a href={solicitud.cvUrl} target="_blank" rel="noreferrer" className="text-sm bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-100">Abrir / Descargar</a>
                  </div>
                  {solicitud.cvUrl.toLowerCase().includes('.pdf') ? (
                    <iframe src={solicitud.cvUrl} className="w-full h-80 rounded border" title="Vista previa" />
                  ) : solicitud.cvUrl.toLowerCase().match(/\.(jpeg|jpg|png)/) ? (
                    <img src={solicitud.cvUrl} alt="Vista previa" className="max-w-full max-h-80 mx-auto rounded border object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <FileText size={48} className="text-blue-300 mb-4" />
                      <p className="text-sm text-slate-600 font-medium">Vista previa no disponible</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No se adjuntó archivo.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}