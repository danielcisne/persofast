// src/pages/ValidacionEstudio.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  ArrowLeft, Save, Edit3, X, CheckCircle2, Phone, ClipboardList
} from 'lucide-react';
import type { Solicitud, CapturaEstudio as ICapturaEstudio } from '../types';
import { useAuth } from '../contexts/AuthContext';

import Paso1InfoGenerica from '../components/captura/Paso1InfoGenerica';
import Paso2EntornoFamiliar from '../components/captura/Paso2EntornoFamiliar';
import Paso3Economia from '../components/captura/Paso3Economia';
import Paso4EducacionAdicional from '../components/captura/Paso4EducacionAdicional';
import Paso5Vivienda from '../components/captura/Paso5Vivienda';
import Paso7Fotografias from '../components/captura/Paso7Fotografias';

const TABS = [
  { id: 'infoGenerica', label: 'I. Info Genérica' },
  { id: 'entornoFamiliar', label: 'II. Entorno Familiar' },
  { id: 'situacionEconomica', label: 'III. Economía' },
  { id: 'educacionYAdicional', label: 'IV. Educación y Adicional' },
  { id: 'vivienda', label: 'V. Vivienda' },
  { id: 'validacionLaboral', label: 'VI. Ref. Laborales (Auditoría)' },
  { id: 'fotografias', label: 'VII. Fotografías' },
];

const VisorDatosLimpios = ({ datos }: { datos: any }) => {
  if (!datos || typeof datos !== 'object' || Object.keys(datos).length === 0) {
    return <p className="text-sm text-slate-400 italic">No hay datos registrados en esta sección.</p>;
  }

  const formatearLlave = (llave: string) => {
    const conEspacios = llave.replace(/([A-Z])/g, ' $1');
    return conEspacios.charAt(0).toUpperCase() + conEspacios.slice(1);
  };

  return (
    <div className="space-y-4">
      {Object.entries(datos).map(([key, value]) => {
        // 🔥 FILTRO: Ignorar llaves nulas, vacías, o que sean el 'id' del documento/array
        if (value === null || value === undefined || value === '' || key === 'id') return null;

        if (Array.isArray(value)) {
          return (
            <div key={key} className="bg-slate-100 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-extrabold text-purple-800 uppercase tracking-wider mb-3">{formatearLlave(key)}</h4>
              <div className="space-y-4">
                {value.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-slate-200 shadow-sm relative">
                    <span className="absolute -top-2 -left-2 bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{index + 1}</span>
                    {typeof item === 'object' ? <VisorDatosLimpios datos={item} /> : <span className="text-sm">{String(item)}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (typeof value === 'object') {
          return (
            <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h4 className="text-xs font-extrabold text-purple-600 uppercase tracking-wider mb-2">{formatearLlave(key)}</h4>
              <VisorDatosLimpios datos={value} />
            </div>
          );
        }

        return (
          <div key={key} className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{formatearLlave(key)}</span>
            <span className="text-sm text-slate-800 bg-white px-3 py-2 rounded-md border border-slate-200 mt-1 break-words whitespace-pre-wrap">
              {String(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function ValidacionEstudio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { perfil, usuario } = useAuth();

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [cargando, setCargando] = useState(true);
  const [activeTab, setActiveTab] = useState(5);
  const [seccionesEditables, setSeccionesEditables] = useState<Record<number, boolean>>({});

  const [captura, setCaptura] = useState<Partial<ICapturaEstudio & { validacionLaboral?: any }>>({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'solicitudes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Solicitud;
          setSolicitud(data);
          
          const cap = data.captura || {};
          const infoGen = cap.infoGenerica || {};
          if (!infoGen.nombreCompleto && data.candidato) {
            const nom = [
              data.candidato.nombre,
              data.candidato.apellidoPaterno,
              data.candidato.apellidoMaterno
            ].filter(Boolean).join(' ');
            
            infoGen.nombreCompleto = nom;
          }

          const sitEco = cap.situacionEconomica || {};
          const tcMonto = sitEco.gastos?.tarjetaCredito;
          let creditos = [...(sitEco.creditos || [])];
          if (tcMonto && Number(tcMonto) > 0) {
            const tieneTc = creditos.some((c: any) => c.isTarjetaCreditoAuto === true);
            if (!tieneTc) {
              creditos.push({
                id: 'tarjeta-credito-auto',
                isTarjetaCreditoAuto: true,
                institucion: 'Tarjeta de Crédito',
                cuenta: 'S/N',
                saldo: tcMonto,
                abonoMensual: ''
              });
              sitEco.creditos = creditos;
            }
          }
          
          setCaptura({
            ...cap,
            infoGenerica: infoGen,
            situacionEconomica: sitEco
          });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [id]);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (cargando) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'solicitudes', id);
        await updateDoc(docRef, { captura: captura });
        console.log("✅ Progreso auto-guardado en la nube");
      } catch (error) {
        console.error("❌ Error en auto-guardado:", error);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [captura, id, cargando]);

  const toggleEdicion = (tabIndex: number) => {
    setSeccionesEditables(prev => ({ ...prev, [tabIndex]: !prev[tabIndex] }));
  };

  const handleValLaboralChange = (seccion: string, campo: string, valor: string) => {
    setCaptura(prev => ({
      ...prev,
      validacionLaboral: {
        ...(prev.validacionLaboral || {}),
        [seccion]: {
          ...(prev.validacionLaboral?.[seccion] || {}),
          [campo]: valor
        }
      }
    }));
  };

  const valLaboral = captura.validacionLaboral || {};

  const guardarCambios = async () => {
    if (!id) return;
    setGuardando(true);
    try {
      const docRef = doc(db, 'solicitudes', id);
      await updateDoc(docRef, { captura: captura });
      setSeccionesEditables({});
      alert("Progreso guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  const finalizarAuditoria = async () => {
    if (!id || !usuario || !perfil) return;
    const confirmacion = window.confirm("¿Estás seguro de finalizar la auditoría? El estatus cambiará a 'Por Aprobar' para la revisión final del Administrador.");
    if (!confirmacion) return;

    setGuardando(true);
    try {
      const batch = writeBatch(db);
      const docRef = doc(db, 'solicitudes', id);
      batch.update(docRef, {
        captura: captura,
        estatus: 'Por Aprobar'
      });

      const bitacoraRef = doc(collection(db, 'solicitudes', id, 'bitacora'));
      batch.set(bitacoraRef, {
        fecha: new Date().toISOString(),
        accion: 'Mesa de Control finalizó la auditoría. El estudio pasa a revisión final del Administrador.',
        usuarioId: usuario.uid,
        nombreUsuario: perfil.nombre
      });

      await batch.commit();
      alert("¡Auditoría finalizada! El estudio pasó a revisión.");
      navigate(`/solicitudes/${id}`);
    } catch (error) {
      console.error("Error al finalizar:", error);
      alert("Hubo un error al finalizar la auditoría.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando Mesa de Control...</div>;
  if (!solicitud) return <div className="p-8 text-center text-red-500">Solicitud no encontrada.</div>;

  const rolesPermitidos = ['Mesa', 'Administrador', 'Administracion'];
  if (perfil && !rolesPermitidos.includes(perfil.rol)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><X size={32} /></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
          <p className="text-slate-600 mb-6">Esta área es exclusiva para el personal de Mesa de Control y Administración.</p>
          <Link to={`/solicitudes/${id}`} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block">Volver a la Solicitud</Link>
        </div>
      </div>
    );
  }

  const isEditingActual = seccionesEditables[activeTab] || false;

  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans antialiased">
      <div className="bg-purple-950 text-white sticky top-0 z-50 shadow-md border-b-4 border-purple-600">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Link to={`/solicitudes/${id}`} className="inline-flex items-center gap-2 text-purple-200 hover:text-white mb-2 transition-colors text-sm font-medium">
                <ArrowLeft size={16} /> Volver al Detalle
              </Link>
              <h1 className="text-xl font-bold flex items-center gap-3">
                Mesa de Control: {solicitud.candidato.nombre} {solicitud.candidato.apellidoPaterno}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={guardarCambios} disabled={guardando} className="bg-purple-900 hover:bg-purple-800 text-purple-100 border border-purple-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50">
                <Save size={18} /> {guardando ? 'Guardando...' : 'Guardar Progreso'}
              </button>
              <button onClick={finalizarAuditoria} disabled={guardando} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50">
                Finalizar Auditoría <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="bg-purple-900/60 mt-2 overflow-x-auto custom-scrollbar">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 flex">
            {TABS.map((tab, index) => (
              <button key={tab.id} onClick={() => setActiveTab(index)} className={`whitespace-nowrap px-6 py-3 text-sm font-medium border-b-4 transition-colors ${activeTab === index ? 'border-white text-white bg-purple-900/80' : 'border-transparent text-purple-300 hover:text-purple-100 hover:bg-purple-800/50'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-8">
        {activeTab !== 5 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{TABS[activeTab].label}</h2>
              {!isEditingActual ? (
                <button onClick={() => toggleEdicion(activeTab)} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors">
                  <Edit3 size={16} /> Editar Sección
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => toggleEdicion(activeTab)} className="text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-md text-sm font-semibold flex items-center gap-1 transition-colors"><X size={16} /> Cancelar</button>
                  <button onClick={guardarCambios} disabled={guardando} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-colors"><Save size={16} /> {guardando ? 'Guardando...' : 'Guardar Cambios'}</button>
                </div>
              )}
            </div>
            <div className={`p-8 transition-all duration-300 ${!isEditingActual ? 'opacity-90 grayscale-[10%] bg-slate-50/50' : ''}`}>
              {!isEditingActual && (
                <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm flex items-center gap-2">
                  🔒 Esta sección está en <strong>Modo Solo Lectura</strong>. Haz clic en "Editar Sección" si necesitas corregir un dato.
                </div>
              )}
              <fieldset disabled={!isEditingActual} className={!isEditingActual ? 'pointer-events-none' : ''}>
                {activeTab === 0 && <Paso1InfoGenerica datos={captura.infoGenerica || {}} onChange={(d) => setCaptura({ ...captura, infoGenerica: d as any })} />}
                {activeTab === 1 && <Paso2EntornoFamiliar datos={captura.entornoFamiliar || {}} onChange={(d) => setCaptura({ ...captura, entornoFamiliar: d as any })} />}
                {activeTab === 2 && <Paso3Economia datos={captura.situacionEconomica || {}} onChange={(d) => setCaptura({ ...captura, situacionEconomica: d as any })} />}
                {activeTab === 3 && <Paso4EducacionAdicional datos={captura.educacionYAdicional || {}} onChange={(d) => setCaptura({ ...captura, educacionYAdicional: d as any })} />}
                {activeTab === 4 && <Paso5Vivienda datos={captura.vivienda || {}} onChange={(d) => setCaptura({ ...captura, vivienda: d as any })} />}
                {activeTab === 6 && <Paso7Fotografias solicitudId={id!} datos={captura.fotografias || {}} onChange={(d) => setCaptura({ ...captura, fotografias: d as any })} />}
              </fieldset>
            </div>
          </div>
        )}

        {/* 🔴 PESTAÑA 6: PANTALLA DIVIDIDA INVERTIDA */}
        {activeTab === 5 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* LADO IZQUIERDO: LECTURA LIMPIA DEL ANALISTA (Espejo invertido) */}
            <div className="bg-slate-50/80 rounded-xl shadow-inner border border-slate-200 p-6 flex flex-col h-[750px]">
              <h2 className="text-xl font-bold text-slate-600 mb-2 flex items-center gap-2.5 opacity-90">
                <ClipboardList size={22} className="text-slate-500" /> Captura de Campo (Analista)
              </h2>
              <p className="text-sm text-slate-400 mb-6 border-b border-slate-200 pb-4">Esta información es de solo lectura y sirve como referencia.</p>
              <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <VisorDatosLimpios datos={captura.laboralYReferencias || {}} />
                </div>
              </div>
            </div>

            {/* LADO DERECHO: NUEVA CAPTURA DE MESA DE CONTROL (Espejo invertido y Reordenado) */}
            <div className="bg-white rounded-xl shadow-lg border-t-4 border-t-purple-600 border-x border-b border-slate-200 p-6 flex flex-col h-[750px]">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2.5">
                <Phone size={24} className="text-purple-600" /> Verificación Telefónica
              </h2>
              <p className="text-sm text-slate-500 mb-6 border-b pb-4">Registra la información corroborada directamente con RH y Referencias.</p>
              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8 pb-8">

                {/* BLOQUE VIIa: Antecedente Laboral 1 (Reordenado) */}
                <div>
                  <h3 className="font-bold text-purple-800 border-b-2 border-purple-200 pb-2.5 mb-5">VIIa. Antecedente Laboral 1</h3>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-4">

                    {/* Sección 1: Datos de la Empresa */}
                    <div className="col-span-2 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la empresa 1:</label>
                        <input value={valLaboral.laboral1?.empresa || ''} onChange={(e) => handleValLaboralChange('laboral1', 'empresa', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Giro:</label>
                          <input value={valLaboral.laboral1?.giro || ''} onChange={(e) => handleValLaboralChange('laboral1', 'giro', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Dirección:</label>
                          <input value={valLaboral.laboral1?.direccion || ''} onChange={(e) => handleValLaboralChange('laboral1', 'direccion', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Teléfonos Empresa:</label>
                          <input value={valLaboral.laboral1?.telefonos || ''} onChange={(e) => handleValLaboralChange('laboral1', 'telefonos', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Jefe Inmediato:</label>
                          <input value={valLaboral.laboral1?.jefe || ''} onChange={(e) => handleValLaboralChange('laboral1', 'jefe', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono Jefe anterior:</label>
                          <input value={valLaboral.laboral1?.telefonoJefe || ''} onChange={(e) => handleValLaboralChange('laboral1', 'telefonoJefe', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Whatsapp:</label>
                          <input value={valLaboral.laboral1?.whatsapp || ''} onChange={(e) => handleValLaboralChange('laboral1', 'whatsapp', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico:</label>
                          <input value={valLaboral.laboral1?.correo || ''} onChange={(e) => handleValLaboralChange('laboral1', 'correo', e.target.value)} type="email" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                      </div>
                    </div>

                    {/* Sección 2: Puestos y Fechas (Corroborados) */}
                    <div className="col-span-2 border-t pt-5 mt-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Puesto Inicial Corroborado:</label>
                          <input value={valLaboral.laboral1?.puestoInicial || ''} onChange={(e) => handleValLaboralChange('laboral1', 'puestoInicial', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Puesto Final Corroborado:</label>
                          <input value={valLaboral.laboral1?.puestoFinal || ''} onChange={(e) => handleValLaboralChange('laboral1', 'puestoFinal', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Ingreso Real:</label>
                          <input value={valLaboral.laboral1?.fechaIngreso || ''} onChange={(e) => handleValLaboralChange('laboral1', 'fechaIngreso', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Salida Real:</label>
                          <input value={valLaboral.laboral1?.fechaSalida || ''} onChange={(e) => handleValLaboralChange('laboral1', 'fechaSalida', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                      </div>
                    </div>

                    {/* Sección 3: Inactividad */}
                    <div className="col-span-2 border-t border-purple-100 pt-5 mt-1 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Periodo sin laborar 1 / Inicio inactividad:</label>
                        <input value={valLaboral.laboral1?.periodoInactividad || ''} onChange={(e) => handleValLaboralChange('laboral1', 'periodoInactividad', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" placeholder="Ej. Enero 2020 a Marzo 2020" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Razón inactividad:</label>
                          <input value={valLaboral.laboral1?.razonInactividad || ''} onChange={(e) => handleValLaboralChange('laboral1', 'razonInactividad', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Fecha reincorporación:</label>
                          <input value={valLaboral.laboral1?.fechaReincorporacion || ''} onChange={(e) => handleValLaboralChange('laboral1', 'fechaReincorporacion', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                      </div>
                    </div>

                    {/* Sección 4: Sueldos y Referencias de RH */}
                    <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 mt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Sueldo Inicial:</label>
                          <input value={valLaboral.laboral1?.sueldoInicial || ''} onChange={(e) => handleValLaboralChange('laboral1', 'sueldoInicial', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Sueldo Final:</label>
                          <input value={valLaboral.laboral1?.sueldoFinal || ''} onChange={(e) => handleValLaboralChange('laboral1', 'sueldoFinal', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">¿Lo admitirían nuevamente?:</label>
                          <input value={valLaboral.laboral1?.loAdmitirian || ''} onChange={(e) => handleValLaboralChange('laboral1', 'loAdmitirian', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Nombre informante & Puesto:</label>
                          <input value={valLaboral.laboral1?.informante || ''} onChange={(e) => handleValLaboralChange('laboral1', 'informante', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Comentarios / Referencia Laboral Corroborada:</label>
                      <textarea value={valLaboral.laboral1?.comentarios || ''} onChange={(e) => handleValLaboralChange('laboral1', 'comentarios', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition resize-none" rows={3} placeholder="RH confirma fechas pero reporta ausentismo..." />
                    </div>
                  </div>
                </div>

                {/* BLOQUE VIIb: Referencias Personales */}
                <div>
                  <h3 className="font-bold text-purple-800 border-b-2 border-purple-200 pb-2.5 mb-5 mt-8">VIIb. Referencias Personales Corroboradas</h3>

                  {/* Referencia 1 */}
                  <div className="bg-slate-50/80 p-5 rounded-lg border border-slate-200 mb-5 relative mt-4">
                    <span className="absolute -top-4 left-4 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">1</span>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del informante:</label>
                        <input value={valLaboral.ref1?.nombre || ''} onChange={(e) => handleValLaboralChange('ref1', 'nombre', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" placeholder="Nombre completo" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono contestado:</label>
                        <input value={valLaboral.ref1?.telefono || ''} onChange={(e) => handleValLaboralChange('ref1', 'telefono', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" placeholder="10 dígitos" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tiempo de conocerlo:</label>
                        <input value={valLaboral.ref1?.tiempo || ''} onChange={(e) => handleValLaboralChange('ref1', 'tiempo', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" placeholder="Ej. 5 años" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ocupación del informante:</label>
                        <input value={valLaboral.ref1?.ocupacion || ''} onChange={(e) => handleValLaboralChange('ref1', 'ocupacion', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Opinión sobre el candidato:</label>
                        <textarea value={valLaboral.ref1?.opinion || ''} onChange={(e) => handleValLaboralChange('ref1', 'opinion', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition resize-none" rows={2} placeholder="La referencia indica que es una persona responsable..." />
                      </div>
                    </div>
                  </div>

                  {/* Referencia 2 */}
                  <div className="bg-slate-50/80 p-5 rounded-lg border border-slate-200 relative mt-6 mb-5">
                    <span className="absolute -top-4 left-4 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">2</span>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del informante:</label>
                        <input value={valLaboral.ref2?.nombre || ''} onChange={(e) => handleValLaboralChange('ref2', 'nombre', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono contestado:</label>
                        <input value={valLaboral.ref2?.telefono || ''} onChange={(e) => handleValLaboralChange('ref2', 'telefono', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tiempo de conocerlo:</label>
                        <input value={valLaboral.ref2?.tiempo || ''} onChange={(e) => handleValLaboralChange('ref2', 'tiempo', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ocupación del informante:</label>
                        <input value={valLaboral.ref2?.ocupacion || ''} onChange={(e) => handleValLaboralChange('ref2', 'ocupacion', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Opinión sobre el candidato:</label>
                        <textarea value={valLaboral.ref2?.opinion || ''} onChange={(e) => handleValLaboralChange('ref2', 'opinion', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition resize-none" rows={2} />
                      </div>
                    </div>
                  </div>

                  {/* Referencia 3 */}
                  <div className="bg-slate-50/80 p-5 rounded-lg border border-slate-200 relative mt-6">
                    <span className="absolute -top-4 left-4 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">3</span>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del informante:</label>
                        <input value={valLaboral.ref3?.nombre || ''} onChange={(e) => handleValLaboralChange('ref3', 'nombre', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono contestado:</label>
                        <input value={valLaboral.ref3?.telefono || ''} onChange={(e) => handleValLaboralChange('ref3', 'telefono', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tiempo de conocerlo:</label>
                        <input value={valLaboral.ref3?.tiempo || ''} onChange={(e) => handleValLaboralChange('ref3', 'tiempo', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ocupación del informante:</label>
                        <input value={valLaboral.ref3?.ocupacion || ''} onChange={(e) => handleValLaboralChange('ref3', 'ocupacion', e.target.value)} type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Opinión sobre el candidato:</label>
                        <textarea value={valLaboral.ref3?.opinion || ''} onChange={(e) => handleValLaboralChange('ref3', 'opinion', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm transition resize-none" rows={2} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}