import React from 'react';
import type { CapturaEstudio } from '../../types';

interface Props {
  datos: Partial<CapturaEstudio['educacionYAdicional']>;
  onChange: (datosActualizados: Partial<CapturaEstudio['educacionYAdicional']>) => void;
}

export default function Paso4EducacionAdicional({ datos = {} as any, onChange }: Props) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...(datos as any), [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-10 animate-fadeIn">

      {/* SECCIÓN IV: ESTUDIOS REALIZADOS */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">IV. Estudios Realizados</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Último grado de estudios:</label>
            <input
              type="text" name="ultimoGrado"
              value={datos?.ultimoGrado || ''} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="¿Preparatoria, licenciatura, secundaria, etc.? Institución, documento, fecha."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Otros estudios (1):</label>
              <input
                type="text" name="otrosEstudios1"
                value={datos?.otrosEstudios1 || ''} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Institución, curso, documento, fecha."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Otros estudios (2):</label>
              <input
                type="text" name="otrosEstudios2"
                value={datos?.otrosEstudios2 || ''} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Institución, curso, documento, fecha."
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN V: INFORMACIÓN ADICIONAL */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">V. Información Adicional</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Partido Político</label>
            <input type="text" name="partidoPolitico" value={datos?.partidoPolitico || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Religión</label>
            <input type="text" name="religion" value={datos?.religion || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Club o Asociación</label>
            <input type="text" name="clubAsociacion" value={datos?.clubAsociacion || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deportes</label>
            <input type="text" name="deportes" value={datos?.deportes || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fuma (Frecuencia)</label>
            <input type="text" name="fuma" value={datos?.fuma || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. 3 al día, No fuma..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bebe (Frecuencia)</label>
            <input type="text" name="bebe" value={datos?.bebe || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Socialmente, No bebe..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Enfermedades</label>
            <input type="text" name="enfermedades" value={datos?.enfermedades || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Padecimientos crónicos..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cirugías</label>
            <input type="text" name="cirugias" value={datos?.cirugias || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </div>

      {/* SECCIÓN Va y Vb: SINDICATOS Y PERCEPCIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Va. Relaciones Sindicales</h3>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sindicato - ¿Quién y cuál? ¿Actual?</label>
          <textarea
            name="sindicato"
            value={datos?.sindicato || ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Detalles sobre participación sindical del candidato o familiares..."
          />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Vb. Apreciación Intrafamiliar</h3>
          <label className="block text-sm font-medium text-slate-700 mb-1">Relaciones a percepción del Investigador:</label>
          <textarea
            name="apreciacionIntrafamiliar"
            value={datos?.apreciacionIntrafamiliar || ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Observaciones del analista sobre la dinámica familiar durante la visita..."
          />
        </div>
      </div>

    </div>
  );
}