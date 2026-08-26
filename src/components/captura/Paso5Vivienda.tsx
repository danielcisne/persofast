import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CapturaEstudio } from '../../types';

interface Props {
  datos: Partial<CapturaEstudio['vivienda']>;
  onChange: (datosActualizados: Partial<CapturaEstudio['vivienda']>) => void;
}

export default function Paso5Vivienda({ datos = {} as any, onChange }: Props) {

  const handleNestedChange = (
    seccion: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    onChange({
      ...(datos as any),
      [seccion]: {
        ...((datos as any)[seccion] || {}),
        [e.target.name]: e.target.value
      }
    });
  };

  const handleBienesTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...(datos as any),
      bienes: {
        ...((datos as any).bienes || {}),
        [e.target.name]: e.target.value
      }
    });
  };

  const handleArrayChange = (arregloKey: string, index: number, campo: string, valor: string) => {
    const nuevosBienes = { ...((datos as any).bienes || {}) };
    const nuevoArreglo = [...(nuevosBienes[arregloKey] || [])];
    nuevoArreglo[index] = { ...nuevoArreglo[index], [campo]: valor };
    onChange({ ...(datos as any), bienes: { ...nuevosBienes, [arregloKey]: nuevoArreglo } });
  };

  const addRow = (arregloKey: string) => {
    const nuevosBienes = { ...((datos as any).bienes || {}) };
    const nuevoArreglo = [...(nuevosBienes[arregloKey] || []), { id: Date.now().toString(), descripcion: '', propietario: '', valor: '', pagado: '' }];
    onChange({ ...(datos as any), bienes: { ...nuevosBienes, [arregloKey]: nuevoArreglo } });
  };

  const removeRow = (arregloKey: string, index: number) => {
    const nuevosBienes = { ...((datos as any).bienes || {}) };
    const nuevoArreglo = [...(nuevosBienes[arregloKey] || [])];
    nuevoArreglo.splice(index, 1);
    onChange({ ...(datos as any), bienes: { ...nuevosBienes, [arregloKey]: nuevoArreglo } });
  };

  return (
    <div className="space-y-10 animate-fadeIn">

      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Va. Presentación Externa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Construcción</label>
            <select name="construccion" value={datos?.externa?.construccion || ''} onChange={(e) => handleNestedChange('externa', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Seleccionar...</option>
              <option value="Casa">Casa</option>
              <option value="Departamento">Departamento</option>
              <option value="Vivienda">Vivienda</option>
              <option value="Depto. en casa">Depto. en casa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <select name="tipo" value={datos?.externa?.tipo || ''} onChange={(e) => handleNestedChange('externa', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Seleccionar...</option>
              <option value="Conservador">Conservador</option>
              <option value="Habitacional">Habitacional</option>
              <option value="Antiguo">Antiguo</option>
              <option value="Semiconstruida">Semiconstruida</option>
              <option value="De lujo">De lujo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fachada</label>
            <input type="text" name="fachada" value={datos?.externa?.fachada || ''} onChange={(e) => handleNestedChange('externa', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Pintada, Granito, Azulejo..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Techos</label>
            <input type="text" name="techos" value={datos?.externa?.techos || ''} onChange={(e) => handleNestedChange('externa', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Concreto, Lámina..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Distribución Interna (Separar por comas)</label>
            <input type="text" name="distribucionInterna" value={datos?.externa?.distribucionInterna || ''} onChange={(e) => handleNestedChange('externa', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Sala, Comedor, Cocina, 3 Recámaras, 2 Baños..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Distribución Externa (Separar por comas)</label>
            <input type="text" name="distribucion" value={datos?.externa?.distribucion || ''} onChange={(e) => handleNestedChange('externa', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Ventanas, Patio, Cochera, Zotehuela, Puertas" />
          </div>
        </div>
      </div>

     
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Vb. Presentación Interna</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">¿Tiene Sala?</label>
            <select name="sala" value={datos?.interna?.sala || ''} onChange={(e) => handleNestedChange('interna', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">¿Tiene Comedor?</label>
            <select name="comedor" value={datos?.interna?.comedor || ''} onChange={(e) => handleNestedChange('interna', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">¿Tiene Cocina?</label>
            <select name="cocina" value={datos?.interna?.cocina || ''} onChange={(e) => handleNestedChange('interna', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">No. Recámaras</label>
            <input type="number" name="recamaras" value={datos?.interna?.recamaras || ''} onChange={(e) => handleNestedChange('interna', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">No. Baños</label>
            <input type="number" name="banos" value={datos?.interna?.banos || ''} onChange={(e) => handleNestedChange('interna', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Otras Hab.</label>
            <input type="text" name="otrasHabitaciones" value={datos?.interna?.otrasHabitaciones || ''} onChange={(e) => handleNestedChange('interna', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Pisos</label>
            <input type="text" name="pisosTipo" value={datos?.interna?.pisosTipo || ''} onChange={(e) => handleNestedChange('interna', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Loseta, Cemento, Madera..." />
          </div>
        </div>
      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Vc. Decorado</h3>
          <label className="block text-sm font-medium text-slate-700 mb-1">Presentación General</label>
          <select name="presentacion" value={datos?.decorado?.presentacion || ''} onChange={(e) => handleNestedChange('decorado', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Seleccionar Nivel...</option>
            <option value="1">1 (Excelente)</option>
            <option value="2">2 (Regular)</option>
            <option value="3">3 (Mala)</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 opacity-0 hidden md:block">Sp</h3>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Decorado</label>
          <input type="text" name="descripcion" value={datos?.decorado?.descripcion || ''} onChange={(e) => handleNestedChange('decorado', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Paredes, estéreo, TV, computadoras, adornos..." />
        </div>
      </div>

     
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Vd. Otras Características</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Inmueble</label>
            <select name="inmueble" value={datos?.caracteristicas?.inmueble || ''} onChange={(e) => handleNestedChange('caracteristicas', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Seleccionar...</option>
              <option value="Propio">Propio</option>
              <option value="Rentado">Rentado</option>
              <option value="Prestado">Prestado</option>
              <option value="Familiares">Familiares</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">¿A nombre de quién?</label>
            <input type="text" name="inmuebleNombre" value={datos?.caracteristicas?.inmuebleNombre || ''} onChange={(e) => handleNestedChange('caracteristicas', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Servicios de la Zona</label>
            <input type="text" name="servicios" value={datos?.caracteristicas?.servicios || ''} onChange={(e) => handleNestedChange('caracteristicas', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Luz, Agua, Teléfono, Pavimento..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sector</label>
            <select name="sector" value={datos?.caracteristicas?.sector || ''} onChange={(e) => handleNestedChange('caracteristicas', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Seleccionar...</option>
              <option value="Popular">Popular</option><option value="Industrial">Industrial</option>
              <option value="Comercial">Comercial</option><option value="Residencial">Residencial</option><option value="Rural">Rural</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Transporte</label>
            <select name="transporte" value={datos?.caracteristicas?.transporte || ''} onChange={(e) => handleNestedChange('caracteristicas', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Seleccionar...</option>
              <option value="Suficiente">Suficiente</option><option value="No suficiente">No suficiente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Espacio Habitacional</label>
            <input type="text" name="espacioHabitacional" value={datos?.caracteristicas?.espacioHabitacional || ''} onChange={(e) => handleNestedChange('caracteristicas', e as any)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tiempo en domicilio actual</label>
              <input type="text" name="tiempoResidenciaActual" value={datos?.caracteristicas?.tiempoResidenciaActual || ''} onChange={(e) => handleNestedChange('caracteristicas', e as any)} className="w-full px-4 py-2.5 rounded border border-slate-300 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tiempo en domicilio anterior</label>
              <input type="text" name="tiempoResidenciaAnterior" value={datos?.caracteristicas?.tiempoResidenciaAnterior || ''} onChange={(e) => handleNestedChange('caracteristicas', e as any)} className="w-full px-4 py-2.5 rounded border border-slate-300 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dirección anterior</label>
              <input type="text" name="direccionAnterior" value={datos?.caracteristicas?.direccionAnterior || ''} onChange={(e) => handleNestedChange('caracteristicas', e as any)} className="w-full px-4 py-2.5 rounded border border-slate-300 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo del cambio</label>
              <input type="text" name="motivoCambio" value={datos?.caracteristicas?.motivoCambio || ''} onChange={(e) => handleNestedChange('caracteristicas', e as any)} className="w-full px-4 py-2.5 rounded border border-slate-300 outline-none" />
            </div>
          </div>
        </div>
      </div>

    
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Ve. Otros Bienes (Autos)</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200 mb-6">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-4 py-3">Año, marca y modelo</th>
                <th className="px-4 py-3">Propietario</th>
                <th className="px-4 py-3">Valor Estimado</th>
                <th className="px-4 py-3 w-32">¿Pagado?</th>
                <th className="px-4 py-3 w-10 text-center">
                  <button onClick={() => addRow('autos')} className="text-blue-600 hover:text-blue-800"><Plus size={18} /></button>
                </th>
              </tr>
            </thead>
            <tbody>
              {(!datos?.bienes?.autos || datos.bienes.autos.length === 0) ? (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-slate-400">Sin autos registrados.</td></tr>
              ) : (
                datos.bienes.autos.map((auto: any, idx: number) => (
                  <tr key={auto.id} className="border-t border-slate-100 bg-white">
                    <td className="p-2"><input type="text" value={auto.descripcion} onChange={(e) => handleArrayChange('autos', idx, 'descripcion', e.target.value)} className="w-full px-2 py-1.5 rounded border outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={auto.propietario} onChange={(e) => handleArrayChange('autos', idx, 'propietario', e.target.value)} className="w-full px-2 py-1.5 rounded border outline-none focus:border-blue-400" /></td>
                    <td className="p-2">
                      <div className="relative"><span className="absolute left-2 top-1 text-slate-400 text-xs">$</span>
                        <input type="number" value={auto.valor} onChange={(e) => handleArrayChange('autos', idx, 'valor', e.target.value)} className="w-full pl-5 pr-2 py-1.5 rounded border outline-none focus:border-blue-400" /></div>
                    </td>
                    <td className="p-2">
                      <select value={auto.pagado} onChange={(e) => handleArrayChange('autos', idx, 'pagado', e.target.value)} className="w-full px-2 py-1.5 rounded border outline-none focus:border-blue-400 bg-white">
                        <option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option>
                      </select>
                    </td>
                    <td className="p-2 text-center"><button onClick={() => removeRow('autos', idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Otros Bienes (Casas o Terrenos)</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200 mb-6">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-4 py-3">Ubicación / Descripción</th>
                <th className="px-4 py-3">Propietario</th>
                <th className="px-4 py-3">Valor Estimado</th>
                <th className="px-4 py-3 w-32">¿Pagado?</th>
                <th className="px-4 py-3 w-10 text-center">
                  <button onClick={() => addRow('inmuebles')} className="text-blue-600 hover:text-blue-800"><Plus size={18} /></button>
                </th>
              </tr>
            </thead>
            <tbody>
              {(!datos?.bienes?.inmuebles || datos.bienes.inmuebles.length === 0) ? (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-slate-400">Sin propiedades registradas.</td></tr>
              ) : (
                datos.bienes.inmuebles.map((inmueble: any, idx: number) => (
                  <tr key={inmueble.id} className="border-t border-slate-100 bg-white">
                    <td className="p-2"><input type="text" value={inmueble.descripcion} onChange={(e) => handleArrayChange('inmuebles', idx, 'descripcion', e.target.value)} className="w-full px-2 py-1.5 rounded border outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={inmueble.propietario} onChange={(e) => handleArrayChange('inmuebles', idx, 'propietario', e.target.value)} className="w-full px-2 py-1.5 rounded border outline-none focus:border-blue-400" /></td>
                    <td className="p-2">
                      <div className="relative"><span className="absolute left-2 top-1 text-slate-400 text-xs">$</span>
                        <input type="number" value={inmueble.valor} onChange={(e) => handleArrayChange('inmuebles', idx, 'valor', e.target.value)} className="w-full pl-5 pr-2 py-1.5 rounded border outline-none focus:border-blue-400" /></div>
                    </td>
                    <td className="p-2">
                      <select value={inmueble.pagado} onChange={(e) => handleArrayChange('inmuebles', idx, 'pagado', e.target.value)} className="w-full px-2 py-1.5 rounded border outline-none focus:border-blue-400 bg-white">
                        <option value="">Sel...</option><option value="Si">Sí</option><option value="No">No</option>
                      </select>
                    </td>
                    <td className="p-2 text-center"><button onClick={() => removeRow('inmuebles', idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Información proporcionada por:</label>
            <input type="text" name="informacionProporcionadaPor" value={datos?.bienes?.informacionProporcionadaPor || ''} onChange={handleBienesTextChange} className="w-full px-4 py-2.5 rounded border border-slate-300 outline-none" placeholder="Nombre del informante..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Actitud del entrevistado:</label>
            <input type="text" name="actitudEntrevistado" value={datos?.bienes?.actitudEntrevistado || ''} onChange={handleBienesTextChange} className="w-full px-4 py-2.5 rounded border border-slate-300 outline-none" placeholder="Cooperativo, nervioso, evasivo..." />
          </div>
        </div>

      </div>

    </div>
  );
}
