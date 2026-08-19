import React from 'react';
import type { CapturaEstudio } from '../../types';

interface Props {
  datos: Partial<CapturaEstudio['infoGenerica']>;
  onChange: (datosActualizados: Partial<CapturaEstudio['infoGenerica']>) => void;
}

export default function Paso1InfoGenerica({ datos = {} as any, onChange }: Props) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'fechaNacimiento' && value) {
      const fechaNac = new Date(value);
      const hoy = new Date();

      let edadCalculada = hoy.getFullYear() - fechaNac.getFullYear();
      const mes = hoy.getMonth() - fechaNac.getMonth();

      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edadCalculada--;
      }

      onChange({
        ...(datos as any),
        fechaNacimiento: value,
        edad: edadCalculada.toString()
      });
    } else {
      onChange({ ...(datos as any), [name]: value });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* SECCIÓN: DEMOGRAFÍA */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Datos Demográficos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
            <input type="text" name="nombreCompleto" value={datos?.nombreCompleto || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre completo del candidato" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lugar de Nacimiento</label>
            <input type="text" name="lugarNacimiento" value={datos?.lugarNacimiento || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. CDMX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
            <input type="date" name="fechaNacimiento" value={datos?.fechaNacimiento || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Edad</label>
            <input type="number" name="edad" value={datos?.edad || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Años" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
            <select name="sexo" value={datos?.sexo || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Seleccionar...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado Civil</label>
            <input type="text" name="estadoCivil" value={datos?.estadoCivil || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Soltero" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">¿Tiene Hijos?</label>
            <select name="hijos" value={datos?.hijos || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Seleccionar...</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECCIÓN: IDENTIFICACIÓN */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Documentos de Identificación</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">RFC</label>
            <input type="text" name="rfc" value={datos?.rfc || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase" placeholder="13 caracteres" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CURP</label>
            <input type="text" name="curp" value={datos?.curp || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase" placeholder="18 caracteres" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">NSS (IMSS)</label>
            <input type="text" name="imss" value={datos?.imss || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="11 dígitos" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Clave de Elector (INE)</label>
            <input type="text" name="noIne" value={datos?.noIne || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">No. Licencia de Conducir</label>
            <input type="text" name="noLicencia" value={datos?.noLicencia || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cartilla Militar</label>
            <input type="text" name="cartilla" value={datos?.cartilla || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </div>

    </div>
  );
}