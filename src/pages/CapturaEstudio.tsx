// src/pages/CapturaEstudio.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Save, CheckCircle2, ChevronRight, ChevronLeft, X } from 'lucide-react';
import type { Solicitud, CapturaEstudio as ICapturaEstudio } from '../types';
import { useAuth } from '../contexts/AuthContext';

import Paso1InfoGenerica from '../components/captura/Paso1InfoGenerica';
import Paso2EntornoFamiliar from '../components/captura/Paso2EntornoFamiliar';
import Paso3Economia from '../components/captura/Paso3Economia';
import Paso4EducacionAdicional from '../components/captura/Paso4EducacionAdicional';
import Paso5Vivienda from '../components/captura/Paso5Vivienda';
import Paso6Laboral from '../components/captura/Paso6Laboral';
import Paso7Fotografias from '../components/captura/Paso7Fotografias';

const TABS = [
  { id: 'infoGenerica', label: 'I. Info Genérica' },
  { id: 'entornoFamiliar', label: 'II. Entorno Familiar' },
  { id: 'situacionEconomica', label: 'III. Economía' },
  { id: 'educacionYAdicional', label: 'IV. Educación y Adicional' },
  { id: 'vivienda', label: 'V. Vivienda' },
  { id: 'laboralYReferencias', label: 'VI. Laboral y Ref.' },
  { id: 'fotografias', label: 'VII. Fotografías' },
];

export default function CapturaEstudio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario, perfil } = useAuth();

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [cargando, setCargando] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);
  const [captura, setCaptura] = useState<Partial<ICapturaEstudio>>({});

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
        console.error("Error al cargar la solicitud:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [id]);

  // 🔥 NUEVO: Efecto para subir la pantalla automáticamente al cambiar de pestaña
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [activeTab]); // Se dispara siempre que el valor de activeTab cambia

  const guardarAvance = useCallback(async (datosActuales: Partial<ICapturaEstudio>) => {
    if (!id) return;
    setGuardando(true);
    try {
      const docRef = doc(db, 'solicitudes', id);
      await updateDoc(docRef, { captura: datosActuales });
      setUltimoGuardado(new Date());
    } catch (error) {
      console.error("Error al autoguardar:", error);
      alert("Error de conexión. Revisa tu internet para no perder datos.");
    } finally {
      setGuardando(false);
    }
  }, [id]);

  const handleNext = async () => {
    await guardarAvance(captura);
    if (activeTab < TABS.length - 1) setActiveTab(prev => prev + 1);
  };

  const handlePrev = async () => {
    await guardarAvance(captura);
    if (activeTab > 0) setActiveTab(prev => prev - 1);
  };

  const handleTabClick = async (index: number) => {
    if (index === activeTab) return;
    await guardarAvance(captura);
    setActiveTab(index);
  };

  const handleFinalizar = async () => {
    if (!window.confirm('¿Estás seguro de finalizar la captura? El estudio pasará a revisión (Integración).')) {
      return;
    }

    setGuardando(true);
    try {
      const docRef = doc(db, 'solicitudes', id!);
      await updateDoc(docRef, {
        captura: captura,
        estatus: 'Integración'
      });

      const bitacoraRef = collection(db, 'solicitudes', id!, 'bitacora');
      await addDoc(bitacoraRef, {
        fecha: new Date().toISOString(),
        accion: 'El analista finalizó la captura de las 7 secciones del estudio socioeconómico.',
        usuarioId: usuario?.uid || 'ID_DESCONOCIDO',
        nombreUsuario: perfil?.nombre || 'Analista'
      });

      alert('¡Estudio finalizado y enviado a Mesa de Control exitosamente!');
      navigate(`/solicitudes/${id}`);

    } catch (error) {
      console.error("Error al finalizar el estudio:", error);
      alert("Hubo un error de conexión al finalizar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando Wizard de Captura...</div>;
  if (!solicitud) return <div className="p-8 text-center text-red-500">Solicitud no encontrada.</div>;

  const rolesPermitidos = ['Analista', 'Administrador', 'Administracion'];

  if (perfil && !rolesPermitidos.includes(perfil.rol)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
          <p className="text-slate-600 mb-6">
            Esta área es exclusiva para Analistas de Campo.
          </p>
          <Link to={`/solicitudes/${id}`} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block">
            Volver a la Solicitud
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-slate-800 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Link to={`/solicitudes/${id}`} className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-2 transition-colors text-sm">
                <ArrowLeft size={16} /> Volver al Detalle
              </Link>
              <h1 className="text-xl font-bold flex items-center gap-3">
                Estudio Socioeconómico: {solicitud.candidato.nombre} {solicitud.candidato.apellidoPaterno}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Folio: FOL-{String(solicitud.folio).padStart(4, '0')} | Empresa: {solicitud.empresa}
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm">
              {guardando ? (
                <span className="text-amber-400 animate-pulse flex items-center gap-2"><Save size={16} /> Guardando...</span>
              ) : ultimoGuardado ? (
                <span className="text-emerald-400 flex items-center gap-2"><CheckCircle2 size={16} /> Guardado {ultimoGuardado.toLocaleTimeString()}</span>
              ) : null}
              <button onClick={handleFinalizar} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm ml-2">
                <Save size={18} /> Guardar y Salir
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-4 overflow-x-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex">
            {TABS.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(index)}
                className={`whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === index
                  ? 'border-blue-400 text-blue-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">
            {TABS[activeTab].label}
          </h2>

          <div className="mt-4">
            {activeTab === 0 && (
              <Paso1InfoGenerica
                datos={captura.infoGenerica || {}}
                onChange={(nuevosDatos) => setCaptura({ ...captura, infoGenerica: nuevosDatos as any })}
              />
            )}

            {activeTab === 1 && (
              <Paso2EntornoFamiliar
                datos={captura.entornoFamiliar || {}}
                onChange={(nuevosDatos) => setCaptura({ ...captura, entornoFamiliar: nuevosDatos as any })}
              />
            )}

            {activeTab === 2 && (
              <Paso3Economia
                datos={captura.situacionEconomica || {}}
                onChange={(nuevosDatos) => setCaptura({ ...captura, situacionEconomica: nuevosDatos as any })}
              />
            )}

            {activeTab === 3 && (
              <Paso4EducacionAdicional
                datos={captura.educacionYAdicional || {}}
                onChange={(nuevosDatos) => setCaptura({ ...captura, educacionYAdicional: nuevosDatos as any })}
              />
            )}

            {activeTab === 4 && (
              <Paso5Vivienda
                datos={captura.vivienda || {}}
                onChange={(nuevosDatos) => setCaptura({ ...captura, vivienda: nuevosDatos as any })}
              />
            )}

            {activeTab === 5 && (
              <Paso6Laboral
                datos={captura.laboralYReferencias || {}}
                onChange={(nuevosDatos) => setCaptura({ ...captura, laboralYReferencias: nuevosDatos as any })}
              />
            )}

            {activeTab === 6 && (
              <Paso7Fotografias
                solicitudId={id!}
                datos={captura.fotografias || {}}
                onChange={(nuevosDatos) => setCaptura({ ...captura, fotografias: nuevosDatos as any })}
              />
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrev}
            disabled={activeTab === 0}
            className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            <ChevronLeft size={20} /> Anterior
          </button>

          {activeTab < TABS.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-bold flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
            >
              Siguiente <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleFinalizar}
              className="px-6 py-3 rounded-lg font-bold flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
            >
              Finalizar Captura <CheckCircle2 size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}