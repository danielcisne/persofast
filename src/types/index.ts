// src/types/index.ts

// 1. ROLES DE USUARIO (Actualizados)
export type RolUsuario = 'Administrador' | 'Analista' | 'Cliente' | 'Mesa' | 'Administracion';

// 2. ESTATUS DE LA SOLICITUD (Actualizados)
// 👇 Agregamos 'Por Aprobar' a los estatus permitidos
export type EstatusSolicitud = 'Recibido' | 'Citado' | 'En Proceso' | 'Integración' | 'Por Aprobar' | 'Completado' | 'Cancelado';

// 3. INTERFACES PRINCIPALES
export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  empresa?: string; // Solo para los clientes
}
export type PerfilUsuario = Usuario;

export interface Candidato {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  celular?: string;
  telefonoCasa?: string;
  correo?: string;
  direccion?: string;
}

export interface Cita {
  fecha: string;
  hora: string;
  quienAgendo: string;
  cuandoAgendo: string;
}

export interface EntradaBitacora {
  id?: string;
  fecha: string;
  accion: string;
  usuarioId: string;
  nombreUsuario: string;
  // Campos extra que usamos de "atrapa-todo"
  titulo?: string;
  descripcion?: string;
  mensaje?: string;
  detalles?: string;
}

// Interfaz flexible para la captura gigante de las 7 secciones
// 👇 IMPORTANTE: Le pusimos "?" a todos para que no marque error cuando estén vacíos
export interface CapturaEstudio {
  infoGenerica?: Record<string, any>;
  entornoFamiliar?: Record<string, any>;
  situacionEconomica?: Record<string, any>;
  educacionYAdicional?: Record<string, any>;
  vivienda?: Record<string, any>;
  laboralYReferencias?: Record<string, any>;
  fotografias?: Record<string, any>;
  validacionLaboral?: Record<string, any>; // <-- Nuestra sección de Mesa de Control
}

// 4. EL CONTRATO PRINCIPAL DE LA SOLICITUD
export interface Solicitud {
  id: string;
  folio?: number | string;
  empresa: string;
  clienteEmail?: string;
  servicio: string;
  puestoSolicitado?: string;
  estatus: EstatusSolicitud;
  candidato: Candidato;
  cita?: Cita;
  cvUrl?: string;
  captura?: CapturaEstudio;
  resultadoValidacion?: string;
}