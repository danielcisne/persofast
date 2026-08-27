import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, runTransaction } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../lib/firebase';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function NuevaSolicitud() {
  const navigate = useNavigate();
  const { perfil, usuario } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [estadoSubida, setEstadoSubida] = useState('');

  const [formData, setFormData] = useState({
    servicio: 'Socioeconómico',
    puestoSolicitado: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    celular: '',
    telefonoCasa: '',
    correo: '',
    direccion: '',
    observaciones: ''
  });

  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo supera el límite de 5MB. Por favor, selecciona un archivo más pequeño.');
        e.target.value = '';
        return;
      }
      setCvFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil || !usuario) return;
    setGuardando(true);

    try {
      let cvUrlFinal = '';

      if (cvFile) {
        setEstadoSubida('Subiendo CV a la nube...');
        const storage = getStorage();
        const archivoRef = ref(storage, `cvs/${Date.now()}_${cvFile.name}`);
        await uploadBytes(archivoRef, cvFile);
        cvUrlFinal = await getDownloadURL(archivoRef);
      }

      setEstadoSubida('Generando Folio y guardando...');

      const contadorRef = doc(db, 'metadata', 'contadores');
      const nuevaSolicitudRef = doc(collection(db, 'solicitudes'));
      const bitacoraRef = doc(collection(db, 'solicitudes', nuevaSolicitudRef.id, 'bitacora'));

      await runTransaction(db, async (transaction) => {
        const contadorDoc = await transaction.get(contadorRef);

        if (!contadorDoc.exists()) {
          throw new Error("¡El documento de contadores no existe en Firestore!");
        }

        const nuevoFolio = contadorDoc.data().totalSolicitudes + 1;
        transaction.update(contadorRef, { totalSolicitudes: nuevoFolio });

        transaction.set(nuevaSolicitudRef, {
          folio: nuevoFolio,
          empresa: perfil.empresa || 'Empresa Interna',
          clienteEmail: perfil.email,
          servicio: formData.servicio,
          puestoSolicitado: formData.puestoSolicitado,
          estatus: 'Recibido',
          fechaSolicitud: new Date().toISOString(),
          observaciones: formData.observaciones,
          cvUrl: cvUrlFinal,
          candidato: {
            nombre: formData.nombre,
            apellidoPaterno: formData.apellidoPaterno,
            apellidoMaterno: formData.apellidoMaterno,
            celular: formData.celular,
            telefonoCasa: formData.telefonoCasa,
            correo: formData.correo,
            direccion: formData.direccion
          }
        });

        transaction.set(bitacoraRef, {
          fecha: new Date().toISOString(),
          accion: 'El cliente creó la solicitud en el sistema y adjuntó los documentos.',
          usuarioId: usuario.uid,
          nombreUsuario: perfil.nombre
        });

        const folioFormateado = `FOL-${String(nuevoFolio).padStart(4, '0')}`;

        const mailClienteRef = doc(collection(db, 'mail'));
        transaction.set(mailClienteRef, {
          to: perfil.email, 
          message: {
            subject: `Persofast - Solicitud Recibida: ${folioFormateado}`,
            html: `<p>Hola <b>${perfil.nombre}</b>,</p>
                   <p>Hemos recibido correctamente tu solicitud de servicio <b>${formData.servicio}</b> para el candidato <b>${formData.nombre} ${formData.apellidoPaterno}</b>.</p>
                   <p>Tu número de seguimiento es el <b>${folioFormateado}</b>. En breve un Analista se pondrá en contacto con el candidato.</p>`
          }
        });

        const mailAdminRef = doc(collection(db, 'mail'));
        transaction.set(mailAdminRef, {
          to: 'admin@persofast.com', 
          message: {
            subject: `🚨 NUEVA SOLICITUD: ${folioFormateado} - ${perfil.empresa}`,
            html: `<p>El cliente <b>${perfil.empresa}</b> ha generado una nueva solicitud.</p>
                   <ul>
                    <li><b>Servicio:</b> ${formData.servicio}</li>
                    <li><b>Candidato:</b> ${formData.nombre} ${formData.apellidoPaterno}</li>
                   </ul>
                   <p>Ingresa al sistema para revisarla y asignar una cita.</p>`
          }
        });

      });

      alert("¡Solicitud creada exitosamente!");
      navigate('/solicitudes');

    } catch (error) {
      console.error("Error al crear la solicitud:", error);
      alert("Hubo un error al generar la solicitud. Revisa la consola.");
    } finally {
      setGuardando(false);
      setEstadoSubida('');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-20">
      <button onClick={() => navigate('/solicitudes')} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft size={20} /> Volver a la lista
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h1 className="text-2xl font-bold text-slate-800">Solicitud de Servicio</h1>
          <p className="text-slate-500 text-sm mt-1">Ingresa los datos del candidato y adjunta su CV para generar el expediente.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">1. Datos del Servicio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Servicio</label>
                <select name="servicio" value={formData.servicio} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="Socioeconómico">Socioeconómico</option>
                  <option value="Psicométrico">Psicométrico</option>
                  <option value="Incidencias Legales">Incidencias Legales</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Puesto Solicitado</label>
                <input type="text" name="puestoSolicitado" required value={formData.puestoSolicitado} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Gerente de Ventas" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">2. Datos del Candidato</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre(s) del solicitante</label>
                <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellido Paterno</label>
                <input type="text" name="apellidoPaterno" required value={formData.apellidoPaterno} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellido Materno</label>
                <input type="text" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número Celular</label>
                <input type="tel" name="celular" required value={formData.celular} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10 dígitos" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Casa</label>
                <input type="tel" name="telefonoCasa" value={formData.telefonoCasa} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Opcional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                <input type="email" name="correo" required value={formData.correo} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="correo@ejemplo.com" />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección Completa</label>
                <input type="text" name="direccion" required value={formData.direccion} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Calle, No. ext, int, Colonia, Alc. o Munip., CP y Ciudad" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">3. Información Adicional</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                <textarea name="observaciones" rows={3} value={formData.observaciones} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Escribe aquí cualquier observación relevante..." />
              </div>

              <div className="bg-slate-50 p-6 rounded-lg border-2 border-dashed border-slate-300">
                <label className="block text-sm font-medium text-slate-700 mb-2">Adjuntar CV (PDF o Imagen)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                  />
                </div>
                {cvFile && <p className="mt-2 text-sm text-emerald-600 font-medium flex items-center gap-1"><UploadCloud size={16} /> Archivo cargado: {cvFile.name}</p>}
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end items-center gap-4">
            {guardando && <span className="text-blue-600 font-medium animate-pulse">{estadoSubida}</span>}
            <button type="submit" disabled={guardando} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 disabled:bg-blue-400 transition-colors shadow-sm">
              <Save size={20} />
              {guardando ? 'Procesando...' : 'Solicitar Servicio'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
