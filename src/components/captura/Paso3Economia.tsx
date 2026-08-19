import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CapturaEstudio } from '../../types';

interface Props {
  datos: Partial<CapturaEstudio['situacionEconomica']>;
  onChange: (datosActualizados: Partial<CapturaEstudio['situacionEconomica']>) => void;
}

export default function Paso3Economia({ datos = {} as any, onChange }: Props) {

  const handleGastoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nuevosGastos = {
      ...(datos?.gastos || {}),
      [name]: value
    };

    let nuevosCreditos = [...(datos?.creditos || [])];

    if (name === 'tarjetaCredito') {
      const idx = nuevosCreditos.findIndex((c: any) => c.isTarjetaCreditoAuto === true);
      if (value && Number(value) > 0) {
        if (idx > -1) {
          nuevosCreditos[idx] = {
            ...nuevosCreditos[idx],
            saldo: value
          };
        } else {
          nuevosCreditos.push({
            id: 'tarjeta-credito-auto',
            isTarjetaCreditoAuto: true,
            institucion: 'Tarjeta de Crédito',
            cuenta: 'S/N',
            saldo: value,
            abonoMensual: ''
          });
        }
      } else {
        if (idx > -1) {
          nuevosCreditos.splice(idx, 1);
        }
      }
    }

    onChange({ 
      ...(datos as any), 
      gastos: nuevosGastos,
      creditos: nuevosCreditos
    });
  };

  const handleArrayChange = (arregloKey: string, index: number, campo: string, valor: string) => {
    const nuevoArreglo = [...((datos as any)[arregloKey] || [])];
    nuevoArreglo[index] = { ...nuevoArreglo[index], [campo]: valor };

    let nuevosGastos = { ...(datos?.gastos || {}) };
    if (arregloKey === 'creditos' && nuevoArreglo[index]?.isTarjetaCreditoAuto && campo === 'saldo') {
      nuevosGastos.tarjetaCredito = valor;
    }

    onChange({ 
      ...(datos as any), 
      [arregloKey]: nuevoArreglo,
      gastos: nuevosGastos
    });
  };

  const addRow = (arregloKey: string, template: any) => {
    const nuevoArreglo = [...((datos as any)[arregloKey] || []), { id: Date.now().toString(), ...template }];
    onChange({ ...(datos as any), [arregloKey]: nuevoArreglo });
  };

  const removeRow = (arregloKey: string, index: number) => {
    const nuevoArreglo = [...((datos as any)[arregloKey] || [])];
    const itemABorrar = nuevoArreglo[index];
    nuevoArreglo.splice(index, 1);

    let nuevosGastos = { ...(datos?.gastos || {}) };
    if (arregloKey === 'creditos' && itemABorrar?.isTarjetaCreditoAuto) {
      delete nuevosGastos.tarjetaCredito;
    }

    onChange({ 
      ...(datos as any), 
      [arregloKey]: nuevoArreglo,
      gastos: nuevosGastos
    });
  };

  const camposGastos = [
    { name: 'luz', label: 'Luz' }, { name: 'agua', label: 'Agua' },
    { name: 'telefono', label: 'Teléfono / Internet' }, { name: 'gas', label: 'Gas' },
    { name: 'alimentos', label: 'Alimentos' }, { name: 'transporte', label: 'Transporte' },
    { name: 'predial', label: 'Predial / Renta' }, { name: 'servidumbre', label: 'Servidumbre' },
    { name: 'gasolina', label: 'Gasolina' }, { name: 'colegiaturas', label: 'Colegiaturas' },
    { name: 'esparcimiento', label: 'Esparcimiento' }, { name: 'otros', label: 'Otros Gastos' },
    { name: 'tarjetaCredito', label: 'Tarjeta de Crédito' }
  ];

  return (
    <div className="space-y-10 animate-fadeIn">

      {/* SECCIÓN III: GASTO FAMILIAR MENSUAL */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">III. Gasto Familiar Mensual</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {camposGastos.map((campo) => (
            <div key={campo.name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{campo.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  name={campo.name}
                  value={datos?.gastos?.[campo.name as keyof typeof datos.gastos] || ''}
                  onChange={handleGastoChange}
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN IIIa: CRÉDITOS VIGENTES */}
      <div>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">IIIa. Créditos Vigentes</h3>
          <button
            onClick={() => addRow('creditos', { institucion: '', cuenta: '', saldo: '', abonoMensual: '' })}
            className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus size={16} /> Agregar Crédito
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-4 py-3">Banco / Institución</th>
                <th className="px-4 py-3">No. de Cuenta</th>
                <th className="px-4 py-3">Saldo</th>
                <th className="px-4 py-3">Abono Mensual</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(!datos?.creditos || datos.creditos.length === 0) ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No hay créditos registrados.</td></tr>
              ) : (
                datos.creditos.map((credito: any, idx: number) => (
                  <tr key={credito.id} className="border-t border-slate-100 bg-white">
                    <td className="p-2"><input type="text" value={credito.institucion} onChange={(e) => handleArrayChange('creditos', idx, 'institucion', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={credito.cuenta} onChange={(e) => handleArrayChange('creditos', idx, 'cuenta', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input type="number" value={credito.saldo} onChange={(e) => handleArrayChange('creditos', idx, 'saldo', e.target.value)} className="w-full pl-6 pr-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" />
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input type="number" value={credito.abonoMensual} onChange={(e) => handleArrayChange('creditos', idx, 'abonoMensual', e.target.value)} className="w-full pl-6 pr-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" />
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <button onClick={() => removeRow('creditos', idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN IIIb: CUENTAS DE AHORRO / INVERSIÓN */}
      <div>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">IIIb. Cuentas de Ahorro, Cheques o Inversión</h3>
          <button
            onClick={() => addRow('cuentas', { institucion: '', cuenta: '', saldo: '', rendimientoMensual: '' })}
            className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus size={16} /> Agregar Cuenta
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-4 py-3">Banco / Institución</th>
                <th className="px-4 py-3">No. de Cuenta</th>
                <th className="px-4 py-3">Saldo Actual</th>
                <th className="px-4 py-3">Rendimiento Mensual</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(!datos?.cuentas || datos.cuentas.length === 0) ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No hay cuentas registradas.</td></tr>
              ) : (
                datos.cuentas.map((cuenta: any, idx: number) => (
                  <tr key={cuenta.id} className="border-t border-slate-100 bg-white">
                    <td className="p-2"><input type="text" value={cuenta.institucion} onChange={(e) => handleArrayChange('cuentas', idx, 'institucion', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2"><input type="text" value={cuenta.cuenta} onChange={(e) => handleArrayChange('cuentas', idx, 'cuenta', e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" /></td>
                    <td className="p-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input type="number" value={cuenta.saldo} onChange={(e) => handleArrayChange('cuentas', idx, 'saldo', e.target.value)} className="w-full pl-6 pr-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" />
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input type="number" value={cuenta.rendimientoMensual} onChange={(e) => handleArrayChange('cuentas', idx, 'rendimientoMensual', e.target.value)} className="w-full pl-6 pr-2 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-400" />
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <button onClick={() => removeRow('cuentas', idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
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