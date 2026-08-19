import React, { useState } from 'react';
import { Camera, Trash2, Loader2, UploadCloud } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import type { CapturaEstudio } from '../../types';

interface Props {
  solicitudId: string;
  datos: Partial<CapturaEstudio['fotografias']>;
  onChange: (datosActualizados: Partial<CapturaEstudio['fotografias']>) => void;
}

export default function Paso7Fotografias({ solicitudId, datos = {} as any, onChange }: Props) {

  const [subiendo, setSubiendo] = useState<Record<string, boolean>>({});

  const categoriasFotos = [
    { id: 'candidato', label: '1. Fotografía del Candidato' },
    { id: 'fachada', label: '2. Fachada Exterior' },
    { id: 'calleIzquierda', label: '3. Calle vista a la Izquierda' },
    { id: 'calleDerecha', label: '4. Calle vista a la Derecha' },
    { id: 'interiorSala', label: '5. Interior (Sala / Comedor)' },
    { id: 'interiorCocina', label: '6. Interior (Cocina)' },
    { id: 'interiorRecamara', label: '7. Interior (Recámara)' },
    { id: 'recibos', label: '8. Recibos / Comprobante de Domicilio' }
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, categoriaId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendo(prev => ({ ...prev, [categoriaId]: true }));

    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${categoriaId}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `estudios/${solicitudId}/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      onChange({ ...(datos as any), [categoriaId]: downloadURL });

    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Hubo un error al subir la fotografía. Intenta de nuevo.");
    } finally {
      setSubiendo(prev => ({ ...prev, [categoriaId]: false }));
    }
  };

  const handleDelete = async (categoriaId: string, urlActual: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta fotografía?")) return;

    setSubiendo(prev => ({ ...prev, [categoriaId]: true }));
    try {
      const fileRef = ref(storage, urlActual);
      await deleteObject(fileRef);

      const nuevosDatos = { ...(datos as any) };
      delete nuevosDatos[categoriaId as keyof typeof nuevosDatos];
      onChange(nuevosDatos as any);

    } catch (error) {
      console.error("Error al borrar imagen:", error);
      const nuevosDatos = { ...(datos as any) };
      delete nuevosDatos[categoriaId as keyof typeof nuevosDatos];
      onChange(nuevosDatos as any);
    } finally {
      setSubiendo(prev => ({ ...prev, [categoriaId]: false }));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <Camera className="text-purple-600" size={24} />
        <div>
          <h3 className="text-lg font-bold text-slate-800">VII. Evidencia Fotográfica</h3>
          <p className="text-sm text-slate-500">Sube las fotografías correspondientes. Los cambios se guardan automáticamente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoriasFotos.map((categoria) => {

          const urlActual = datos?.[categoria.id as keyof typeof datos] as string | undefined;
          const estaSubiendo = subiendo[categoria.id];

          return (
            <div key={categoria.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-64">

              <div className="bg-slate-50 p-3 border-b border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-700 uppercase">{categoria.label}</span>
              </div>

              <div className="flex-1 relative bg-slate-100 flex items-center justify-center p-2">

                {estaSubiendo && (
                  <div className="absolute inset-0 z-10 bg-white/80 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-purple-600 mb-2" size={32} />
                    <span className="text-xs font-semibold text-slate-600">Procesando...</span>
                  </div>
                )}

                {urlActual && !estaSubiendo ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={urlActual}
                      alt={categoria.label}
                      className="w-full h-full object-cover rounded shadow-sm border border-slate-200"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                      <button
                        onClick={() => handleDelete(categoria.id, urlActual)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform transform hover:scale-110"
                        title="Eliminar foto"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="text-xs text-slate-500 font-semibold mb-1">Click para subir</p>
                      <p className="text-[10px] text-slate-400 text-center px-4">PNG, JPG hasta 5MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg, image/png, image/webp"
                      onChange={(e) => handleUpload(e, categoria.id)}
                    />
                  </label>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}