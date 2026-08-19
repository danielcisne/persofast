# ⚡ PersoFast PWA - Sistema de Gestión de Estudios Socioeconómicos

![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwindcss)
![Firebase](https://img.shields.io/badge/Firebase-v12.10-FFCA28?logo=firebase)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)
![License](https://img.shields.io/badge/License-MIT-green)

**PersoFast PWA** es una aplicación web progresiva (Progressive Web App) empresarial diseñada para la gestión, captura, validación y generación de reportes de **Estudios Socioeconómicos y Procesos de Selección de Personal** en tiempo real.

Ofrece una arquitectura robusta basada en React 19 y Firebase, con control de acceso por roles (RBAC), wizard de captura progresiva de 7 pasos con autoguardado, mapas interactivos para analistas de campo, exportación automática de expedientes a PDF y entorno emulado local para desarrollo seguro.

---

## 📸 Vista General y Capacidades

- 🔐 **Control de Acceso basado en Roles (RBAC)**: Vistas y permisos adaptados según el perfil (`Administrador`, `Analista`, `Cliente`, `Mesa`, `Administración`).
- 📋 **Gestión Atómica de Solicitudes**: Folios atómicos consecutivos (`FOL-0001`, `FOL-0002`...) mediante transacciones en Cloud Firestore y almacenamiento de CVs en Firebase Storage.
- 🧙‍♂️ **Wizard de Captura Socioeconómica (7 Módulos)**: Formulario paso a paso optimizado para trabajo en campo con guardado en segundo plano:
  1. **Información Genérica**: Datos personales, estado civil, dependientes y salud.
  2. **Entorno Familiar**: Estructura familiar, habitabilidad y referencias socio-familiares.
  3. **Situación Económica**: Ingresos, egresos, activos, deudas y presupuesto mensual.
  4. **Educación y Formación Adicional**: Nivel académico, cursos, diplomados e idiomas.
  5. **Vivienda y Servicios**: Tipo de inmueble, distribución de espacios, servicios públicos y zona.
  6. **Antecedentes Laborales**: Historial de empleos, motivos de salida y validación de referencias.
  7. **Evidencias Fotográficas**: Galería fotográfica categorizada (fachada, interiores, candidato) con subida a Firebase Storage.
- 🗺️ **Integración de Geolocalización (Google Maps API)**: Mapeo visual interactivo de la ubicación del candidato para analistas y supervisores.
- 📊 **Dashboard Métrico en Tiempo Real**: Métricas consolidadas de estudios activos, en proceso, completados y analistas desplegados con aislamiento de datos por empresa cliente.
- 📄 **Exportación de Expedientes a PDF**: Generación automatizada de reportes descargables en el navegador mediante `@react-pdf/renderer`.
- 🧪 **Desarrollo Decoplado con Firebase Emulators**: Entorno local offline para desarrollo y testing sin consumo de recursos en producción.

---

## 🛠️ Tech Stack

### Frontend & UI
- **Framework**: [React 19](https://react.dev/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Bundler**: [Vite 7](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- **Enrutamiento**: [React Router v7](https://reactrouter.com/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Documentos PDF**: [`@react-pdf/renderer`](https://react-pdf.org/)

### Backend & Cloud (BaaS)
- **Base de Datos**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Autenticación**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Almacenamiento**: [Firebase Storage](https://firebase.google.com/docs/storage)
- **Emuladores**: [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite)

---

## 📂 Estructura del Proyecto

```text
persofast-pwa/
├── .env.example                 # Plantilla de variables de entorno seguras
├── .gitignore                   # Reglas de exclusión para Git y llaves sensibles
├── datos-locales/               # Dump de datos para Emuladores Locales de Firebase
├── firebase.json                # Configuración de servicios y emuladores Firebase
├── firestore.rules              # Reglas de seguridad para Firestore (RBAC)
├── storage.rules                # Reglas de seguridad para Firebase Storage
├── public/                      # Assets estáticos y manifiesto PWA
├── src/
│   ├── assets/                  # Logos, imágenes y elementos gráficos
│   ├── components/              # Componentes reutilizables de UI
│   │   ├── captura/             # Componentes del Wizard de 7 Pasos
│   │   ├── pdf/                 # Plantillas de renderizado de PDF
│   │   └── RutaPrivada.tsx      # Guard de enrutamiento por autenticación y rol
│   ├── contexts/                # Estado global (AuthContext)
│   ├── layouts/                 # Plantillas de diseño (MainLayout, Sidebar)
│   ├── lib/                     # Inicialización de Firebase SDK y Emuladores
│   ├── pages/                   # Vistas principales de la aplicación
│   │   ├── Dashboard.tsx        # Métricas y resumen ejecutivo
│   │   ├── Solicitudes.tsx      # Listado general con búsqueda y filtros
│   │   ├── NuevaSolicitud.tsx   # Creación de estudio y asignación de folio
│   │   ├── SolicitudDetalle.tsx # Detalle, mapa, bitácora y agendado de cita
│   │   ├── CapturaEstudio.tsx   # Wizard de captura socioeconómica
│   │   ├── ValidacionEstudio.tsx# Auditoría y dictamen de estudio
│   │   ├── Equipo.tsx           # Administración de usuarios y analistas
│   │   └── Login.tsx            # Autenticación de usuarios
│   ├── types/                   # Definiciones de TypeScript (Interfaces y Types)
│   ├── App.tsx                  # Enrutador principal y proveedores
│   └── main.tsx                 # Punto de entrada de React
└── vite.config.ts               # Configuración de Vite y plugins
```

---

## 🚀 Guía de Instalación y Configuración

### 1. Requisitos Previos
Asegúrate de contar con los siguientes elementos en tu sistema:
- **Node.js** v18.0.0 o superior
- **npm** v9.0.0 o superior
- **Java Runtime Environment (JRE)** v11 o superior (necesario para los emuladores locales de Firebase)
- **Firebase CLI** (`npm install -g firebase-tools`)

---

### 2. Clonar el Repositorio e Instalar Dependencias

```bash
# Clonar el proyecto
git clone https://github.com/tu-usuario/persofast-pwa.git

# Entrar al directorio
cd persofast-pwa

# Instalar dependencias
npm install
```

---

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto basándote en la plantilla `.env.example`:

```bash
cp .env.example .env.local
```

Rellena las variables en `.env.local` con las credenciales correspondientes de tu consola de Firebase o desarrollo local:

```env
VITE_FIREBASE_API_KEY="tu_api_key"
VITE_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="tu-proyecto"
VITE_FIREBASE_STORAGE_BUCKET="tu-proyecto.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="tu_messaging_sender_id"
VITE_FIREBASE_APP_ID="tu_app_id"
VITE_MAPS_API_KEY="tu_google_maps_key" # Opcional
```

---

### 4. Iniciar los Emuladores Locales de Firebase

Para trabajar de forma segura sin afectar datos reales en la nube, inicia los emuladores con el dataset preconfigurado:

```bash
npx firebase emulators:start --import=datos-locales
```

Los emuladores iniciarán en los siguientes puertos locales:
- 🔐 **Auth Emulator**: `http://127.0.0.1:9099`
- 📄 **Firestore Emulator**: `http://127.0.0.1:8080`
- 📁 **Storage Emulator**: `http://127.0.0.1:9199`
- 🖥️ **Emulator Suite UI**: `http://127.0.0.1:4000`

---

### 5. Iniciar la Aplicación en Desarrollo

En otra terminal, ejecuta el servidor de desarrollo de Vite:

```bash
npm run dev
```

Abre tu navegador en `http://localhost:5173`. La aplicación detectará automáticamente el entorno de desarrollo y se conectará a los emuladores locales.

---

## 🛡️ Seguridad y Protección de Datos

Este proyecto está preparado para repositorios públicos y privados con las siguientes medidas de seguridad implementadas:

1. **Sin secretos en el código fuente**: Todas las llaves de API y configuraciones de Firebase se consumen a través de `import.meta.env.*`.
2. **Exclusión estricta en `.gitignore`**: El archivo `.gitignore` excluye automáticamente:
   - Archivos `.env`, `.env.local` y variaciones `*.local`.
   - Credenciales, llaves privadas (`*.pem`) y logs (`*.log`).
   - Artefactos de compilación (`dist/`) y cachés del editor (`.vscode/`).
3. **Reglas de Seguridad en Cloud Firestore (`firestore.rules`)**:
   - Restricción de lectura/escritura basada en el rol de usuario almacenado en `/usuarios/{uid}`.
   - Clientes limitados estrictamente a ver únicamente las solicitudes correspondientes a su empresa.
   - Generación e incremento atómico de folios en la colección `/metadata/contadores`.
4. **Reglas de Seguridad en Firebase Storage (`storage.rules`)**:
   - Validación de tipos MIME (solo PDF e Imágenes permitidas).
   - Límite de tamaño máximo de archivo (5 MB por subida).

---

## 📜 Scripts Disponibles

En el archivo `package.json` dispones de los siguientes comandos:

- `npm run dev`: Inicia el servidor de desarrollo local con Vite.
- `npm run build`: Ejecuta la verificación de tipos con TypeScript (`tsc -b`) y compila la aplicación para producción en la carpeta `dist/`.
- `npm run preview`: Previsualiza localmente la compilación de producción generada en `dist/`.
- `npm run lint`: Ejecuta ESLint para analizar el código en busca de posibles errores o inconsistencias.

---

## 👥 Matriz de Roles y Permisos (RBAC)

| Rol | Dashboard | Crear Solicitud | Captura (Wizard) | Validar / Dictamen | Gestión de Equipo |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Administrador** | 🟢 Completo | 🟢 Sí | 🟢 Sí | 🟢 Sí | 🟢 Sí |
| **Analista** | 🟢 Filtrado | 🔴 No | 🟢 Sí | 🔴 No | 🔴 No |
| **Cliente** | 🟢 Solo Empresa | 🟢 Sí (Su Empresa) | 🔴 No | 🔴 No | 🔴 No |
| **Mesa de Trabajo** | 🟢 Completo | 🔴 No | 🟢 Validación Laboral | 🟢 Sí | 🔴 No |
| **Administración** | 🟢 Completo | 🟢 Sí | 🟢 Sí | 🟢 Sí | 🔴 No |

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Puedes usarlo, modificarlo y distribuirlo libremente.

---

<p center="true">Desarrollado con ❤️ para optimizar los procesos de selección y estudios socioeconómicos en México y Latinoamérica.</p>
