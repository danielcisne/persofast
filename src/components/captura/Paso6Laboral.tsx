import { Plus, Trash2 } from 'lucide-react';
import type { CapturaEstudio } from '../../types';

interface Props {
  datos: Partial<CapturaEstudio['laboralYReferencias']>;
  onChange: (datosActualizados: Partial<CapturaEstudio['laboralYReferencias']>) => void;
}

export default function Paso6Laboral({ datos = {} as any, onChange }: Props) {

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

  const empleoTemplate = {
    empresa: '', giro: '', telefono: '', direccion: '',
    jefeDirecto: '', puestoJefe: '',
    fechaIngreso: '', puestoInicial: '', sueldoInicial: '',
    fechaEgreso: '', puestoFinal: '', sueldoFinal: '',
    motivoSalida: '', comentarios: ''
  };

  return (
    <div className="space-y-10 animate-fadeIn">

     
      <div>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">VIa. Historial Laboral (Del más reciente al más antiguo)</h3>
          <button
            onClick={() => addRow('antecedentes', empleoTemplate)}
            className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus size={16} /> Agregar Empleo
          </button>
        </div>

        {(!datos?.antecedentes || datos.antecedentes.length === 0) ? (
          <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
            No hay empleos registrados. Haz clic en "Agregar Empleo".
          </div>
        ) : (
          <div className="space-y-8">
            {datos.antecedentes.map((empleo: any, idx: number) => (
              <div key={empleo.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative">

                <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    Empleo {idx === 0 ? '(Actual / Último)' : `Anterior ${idx}`}
                  </h4>
                  <button onClick={() => removeRow('antecedentes', idx)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Empresa</label>
                    <input type="text" value={empleo.empresa || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'empresa', e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400 bg-white" placeholder="Razón social..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Giro</label>
                    <input type="text" value={empleo.giro || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'giro', e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400 bg-white" placeholder="Ej. Comercial..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Teléfono</label>
                    <input type="text" value={empleo.telefono || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'telefono', e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400 bg-white" />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Dirección</label>
                    <input type="text" value={empleo.direccion || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'direccion', e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400 bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                  <div className="hidden md:block font-semibold text-slate-600 text-xs uppercase bg-slate-100 py-1.5 px-2 rounded text-center">Al Ingresar</div>
                  <div className="hidden md:block font-semibold text-slate-600 text-xs uppercase bg-slate-100 py-1.5 px-2 rounded text-center">Al Salir / Actual</div>
                  <div className="hidden md:block font-semibold text-slate-600 text-xs uppercase bg-slate-100 py-1.5 px-2 rounded text-center">Jefatura y Salida</div>

                  <div>
                    <label className="block text-xs font-bold text-blue-600 md:hidden mb-2 uppercase border-b pb-1">-- Al Ingresar --</label>
                    <label className="block text-xs text-slate-500 mb-1">Fecha de Ingreso</label>
                    <input type="month" lang="es-MX" value={empleo.fechaIngreso || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'fechaIngreso', e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-600 md:hidden mb-2 uppercase border-b pb-1 mt-4">-- Al Salir --</label>
                    <label className="block text-xs text-slate-500 mb-1">Fecha de Egreso</label>
                    <input type="month" lang="es-MX" value={empleo.fechaEgreso || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'fechaEgreso', e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-600 md:hidden mb-2 uppercase border-b pb-1 mt-4">-- Jefatura --</label>
                    <label className="block text-xs text-slate-500 mb-1">Jefe Directo</label>
                    <input type="text" value={empleo.jefeDirecto || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'jefeDirecto', e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400" placeholder="Nombre completo..." />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Puesto Inicial</label>
                    <input type="text" value={empleo.puestoInicial || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'puestoInicial', e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Puesto Final</label>
                    <input type="text" value={empleo.puestoFinal || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'puestoFinal', e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Puesto del Jefe</label>
                    <input type="text" value={empleo.puestoJefe || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'puestoJefe', e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400" />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Sueldo Mensual Inicial</label>
                    <div className="relative"><span className="absolute left-2 top-2 text-slate-400">$</span>
                      <input type="number" value={empleo.sueldoInicial || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'sueldoInicial', e.target.value)} className="w-full pl-6 pr-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400" placeholder="0.00" /></div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Sueldo Mensual Final</label>
                    <div className="relative"><span className="absolute left-2 top-2 text-slate-400">$</span>
                      <input type="number" value={empleo.sueldoFinal || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'sueldoFinal', e.target.value)} className="w-full pl-6 pr-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400" placeholder="0.00" /></div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Motivo de Salida</label>
                    <input type="text" value={empleo.motivoSalida || ''} onChange={(e) => handleArrayChange('antecedentes', idx, 'motivoSalida', e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400 text-amber-700 font-medium bg-amber-50" placeholder="Renuncia, recorte..." />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Comentarios / Referencia Laboral obtenida</label>
                  <textarea
                    value={empleo.comentarios || ''}
                    onChange={(e) => handleArrayChange('antecedentes', idx, 'comentarios', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-400 resize-none text-sm"
                    placeholder="Lo recomendaron ampliamente, fue conflictivo, etc..."
                  />
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">VIb. Referencias Personales</h3>
          <button
            onClick={() => addRow('referencias', { nombre: '', tiempoConocerlo: '', relacion: '', domicilio: '', telefono: '', ocupacion: '', comentarios: '' })}
            className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus size={16} /> Agregar Referencia
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-4 py-3">Nombre Completo</th>
                <th className="px-4 py-3 w-32">Tiempo de conocerlo</th>
                <th className="px-4 py-3">Ocupación</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Comentarios obtenidos</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(!datos?.referencias || datos.referencias.length === 0) ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No hay referencias registradas.</td></tr>
              ) : (
                datos.referencias.map((ref: any, idx: number) => (
                  <tr key={ref.id} className="border-t border-slate-100 bg-white">
                    <td className="p-2"><input type="text" value={ref.nombre || ''} onChange={(e) => handleArrayChange('referencias', idx, 'nombre', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" placeholder="Nombre..." /></td>
                    <td className="p-2"><input type="text" value={ref.tiempoConocerlo || ''} onChange={(e) => handleArrayChange('referencias', idx, 'tiempoConocerlo', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" placeholder="Ej. 5 años" /></td>
                    <td className="p-2"><input type="text" value={ref.ocupacion || ''} onChange={(e) => handleArrayChange('referencias', idx, 'ocupacion', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" placeholder="A qué se dedica..." /></td>
                    <td className="p-2"><input type="text" value={ref.telefono || ''} onChange={(e) => handleArrayChange('referencias', idx, 'telefono', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={ref.comentarios || ''} onChange={(e) => handleArrayChange('referencias', idx, 'comentarios', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" placeholder="Concepto del candidato..." /></td>
                    <td className="p-2 text-center">
                      <button onClick={() => removeRow('referencias', idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
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
