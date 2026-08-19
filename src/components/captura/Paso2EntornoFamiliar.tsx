import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CapturaEstudio } from '../../types';

interface Props {
  datos: Partial<CapturaEstudio['entornoFamiliar']>;
  onChange: (datosActualizados: Partial<CapturaEstudio['entornoFamiliar']>) => void;
}

export default function Paso2EntornoFamiliar({ datos = {} as any, onChange }: Props) {

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...(datos as any), [e.target.name]: e.target.value });
  };

  const handleArrayChange = (arregloKey: string, index: number, campo: string, valor: string) => {
    const nuevoArreglo = [...((datos as any)[arregloKey] || [])];
    nuevoArreglo[index] = { ...nuevoArreglo[index], [campo]: valor };
    onChange({ ...(datos as any), [arregloKey]: nuevoArreglo });
  };

  const addRow = (arregloKey: string, template: any) => {
    const nuevoArreglo = [...((datos as any)[arregloKey] || []), { id: Date.now().toString(), ...template }];
    onChange({ ...(datos as any), [arregloKey]: nuevoArreglo });
  };

  const removeRow = (arregloKey: string, index: number) => {
    const nuevoArreglo = [...((datos as any)[arregloKey] || [])];
    nuevoArreglo.splice(index, 1);
    onChange({ ...(datos as any), [arregloKey]: nuevoArreglo });
  };

  return (
    <div className="space-y-10 animate-fadeIn">

      {/* SECCIÓN II. APORTACIÓN */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Aportación del solicitante:</label>
        <input
          type="text" name="aportacionSolicitante"
          value={datos?.aportacionSolicitante || ''}
          onChange={handleTextChange}
          className="w-full md:w-1/2 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ej. $5,000 mensuales, Gasto completo, etc."
        />
      </div>

      {/* SECCIÓN IIa. HABITAN EN EL DOMICILIO */}
      <div>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">IIa. Personas que habitan en el mismo domicilio</h3>
          <button
            onClick={() => addRow('habitanDomicilio', { nombre: '', edad: '', parentesco: '', ocupacion: '', escolaridad: '', aporta: '' })}
            className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus size={16} /> Agregar Persona
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3 w-20">Edad</th>
                <th className="px-4 py-3">Parentesco</th>
                <th className="px-4 py-3">Ocupación</th>
                <th className="px-4 py-3">Escolaridad</th>
                <th className="px-4 py-3">Aporta</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(!datos?.habitanDomicilio || datos.habitanDomicilio.length === 0) ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">No hay personas registradas. Haz clic en "Agregar Persona".</td></tr>
              ) : (
                datos.habitanDomicilio.map((persona: any, idx: number) => (
                  <tr key={persona.id} className="border-t border-slate-100 bg-white">
                    <td className="p-2"><input type="text" value={persona.nombre} onChange={(e) => handleArrayChange('habitanDomicilio', idx, 'nombre', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="number" value={persona.edad} onChange={(e) => handleArrayChange('habitanDomicilio', idx, 'edad', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={persona.parentesco} onChange={(e) => handleArrayChange('habitanDomicilio', idx, 'parentesco', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={persona.ocupacion} onChange={(e) => handleArrayChange('habitanDomicilio', idx, 'ocupacion', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={persona.escolaridad} onChange={(e) => handleArrayChange('habitanDomicilio', idx, 'escolaridad', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={persona.aporta} onChange={(e) => handleArrayChange('habitanDomicilio', idx, 'aporta', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2 text-center">
                      <button onClick={() => removeRow('habitanDomicilio', idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN IIb. FAMILIA DE ORIGEN */}
      <div>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">IIb. Familia de origen (Padres y Hermanos)</h3>
          <button
            onClick={() => addRow('familiaOrigen', { nombre: '', edad: '', parentesco: '', ocupacion: '', domicilio: '' })}
            className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus size={16} /> Agregar Familiar
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3 w-20">Edad</th>
                <th className="px-4 py-3">Parentesco</th>
                <th className="px-4 py-3">Ocupación</th>
                <th className="px-4 py-3">Domicilio (Ciudad/Estado)</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(!datos?.familiaOrigen || datos.familiaOrigen.length === 0) ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No hay familiares registrados.</td></tr>
              ) : (
                datos.familiaOrigen.map((familiar: any, idx: number) => (
                  <tr key={familiar.id} className="border-t border-slate-100 bg-white">
                    <td className="p-2"><input type="text" value={familiar.nombre} onChange={(e) => handleArrayChange('familiaOrigen', idx, 'nombre', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="number" value={familiar.edad} onChange={(e) => handleArrayChange('familiaOrigen', idx, 'edad', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={familiar.parentesco} onChange={(e) => handleArrayChange('familiaOrigen', idx, 'parentesco', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={familiar.ocupacion} onChange={(e) => handleArrayChange('familiaOrigen', idx, 'ocupacion', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={familiar.domicilio} onChange={(e) => handleArrayChange('familiaOrigen', idx, 'domicilio', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2 text-center">
                      <button onClick={() => removeRow('familiaOrigen', idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN IIc. RELACIONES EN LA EMPRESA */}
      <div>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">IIc. Relaciones trabajando en la empresa</h3>
          <button
            onClick={() => addRow('familiaresEmpresa', { nombre: '', puesto: '', area: '', relacion: '' })}
            className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus size={16} /> Agregar Contacto
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Puesto</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3">Relación</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(!datos?.familiaresEmpresa || datos.familiaresEmpresa.length === 0) ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No hay contactos registrados.</td></tr>
              ) : (
                datos.familiaresEmpresa.map((contacto: any, idx: number) => (
                  <tr key={contacto.id} className="border-t border-slate-100 bg-white">
                    <td className="p-2"><input type="text" value={contacto.nombre} onChange={(e) => handleArrayChange('familiaresEmpresa', idx, 'nombre', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={contacto.puesto} onChange={(e) => handleArrayChange('familiaresEmpresa', idx, 'puesto', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={contacto.area} onChange={(e) => handleArrayChange('familiaresEmpresa', idx, 'area', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={contacto.relacion} onChange={(e) => handleArrayChange('familiaresEmpresa', idx, 'relacion', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2 text-center">
                      <button onClick={() => removeRow('familiaresEmpresa', idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}