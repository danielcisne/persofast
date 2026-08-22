# PersoFast PWA

> Plataforma web para la gestión, captura, validación y documentación de estudios socioeconómicos.

PersoFast es una Progressive Web App desarrollada con React, TypeScript, Vite y Firebase para centralizar el flujo operativo de estudios socioeconómicos, desde la creación y captura de solicitudes hasta la validación, gestión de evidencias y generación de reportes PDF.

## Funcionalidades

- Autenticación y control de acceso basado en roles (RBAC).
- Gestión de solicitudes y folios consecutivos.
- Flujo de captura socioeconómica estructurado en 7 módulos.
- Autoguardado durante la captura.
- Gestión de información personal, familiar, económica, educativa, habitacional y laboral.
- Captura y almacenamiento de evidencias fotográficas.
- Integración con Google Maps.
- Dashboard con métricas operativas.
- Bitácora de seguimiento.
- Validación y dictamen de estudios.
- Generación de reportes PDF.

## Roles

La aplicación implementa diferentes niveles de acceso:

| Rol | Función principal |
|---|---|
| **Administrador** | Administración general y gestión del sistema |
| **Analista** | Operación y captura de estudios |
| **Cliente** | Gestión y consulta de solicitudes de su empresa |
| **Mesa** | Operación y validación de información laboral |
| **Administración** | Operación, captura y validación |

El control de acceso se implementa mediante roles y Firebase Security Rules.

## Stack tecnológico

### Frontend

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- React Router 7
- Lucide React
- `@react-pdf/renderer`

### Backend

- Firebase Authentication
- Cloud Firestore
- Firebase Storage

## Flujo principal

```text
Solicitud
   │
   ├── Información del candidato
   ├── Información familiar
   ├── Situación económica
   ├── Educación
   ├── Vivienda y servicios
   ├── Antecedentes laborales
   └── Evidencias fotográficas
          │
          ▼
     Validación / Dictamen
          │
          ▼
       Reporte PDF
```

## Instalación

### Requisitos

- Node.js
- npm
- Firebase CLI

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/danielcisne/persofast.git
cd persofast
npm install
```

### Variables de entorno

Crea un archivo `.env.local` a partir de `.env.example`.

**macOS / Linux**

```bash
cp .env.example .env.local
```

**Windows PowerShell**

```powershell
Copy-Item .env.example .env.local
```

Configura las variables correspondientes a tu entorno Firebase y Google Maps.

Los archivos `.env` y `.env.local` están excluidos del control de versiones mediante `.gitignore`.

## Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

## Firebase Emulators

El proyecto incluye configuración para ejecutar servicios de Firebase localmente.

```bash
npx firebase emulators:start
```

## Build

Genera la compilación de producción:

```bash
npm run build
```

## Seguridad

El proyecto utiliza Firebase Authentication y Firebase Security Rules para controlar el acceso a información y archivos según el usuario, rol y contexto de la solicitud.

Las variables de entorno y configuraciones locales se mantienen fuera del control de versiones.

## Estado del proyecto

**Proyecto funcional · Portfolio**

PersoFast representa una implementación funcional de una plataforma para la gestión de estudios socioeconómicos y demuestra la integración de una aplicación React/TypeScript con servicios administrados de Firebase.

## Licencia

Este repositorio no incluye actualmente una licencia de código abierto.

## Autor

**Daniel Cisneros Medina**

Desarrollo web · Aplicaciones empresariales · Integraciones cloud
