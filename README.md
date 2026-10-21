# ⚔️ Saga Académica — LMS RPG 2D

Plataforma web gamificada con temática RPG para la gestión y evaluación académica. Los estudiantes son **Héroes del Gremio** que ganan XP y niveles al combatir **Jefes Finales** (evaluaciones) y completar **Misiones de Laboratorio** (tareas), mientras los profesores actúan como **Game Masters** que crean los temas, contenidos y evaluaciones sobre un **Mapa 2D** de biomas.

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| 🧙‍♂️ **Game Master** (Profesor) | Gestiona biomas, pergaminos, jefes, misiones y califica entregas | Correo + contraseña |
| ⚔️ **Héroe** (Estudiante) | Explora el mapa, rinde evaluaciones y entrega misiones | Código único `EST-XXXX` |

[![Node](https://img.shields.io/badge/node-%E2%89%A5%2020-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/sqlite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)
[![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

## 📋 Índice

- [Características](#-características)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación y ejecución](#-instalación-y-ejecución)
- [Cuentas de demostración](#-cuentas-de-demostración)
- [Rutas de la aplicación](#-rutas-de-la-aplicación)
- [API REST](#-api-rest)
- [Sistema de progreso RPG](#-sistema-de-progreso-rpg)
- [Copiloto IA (opcional)](#-copiloto-ia-opcional)
- [Notas de seguridad](#-notas-de-seguridad)

## ✨ Características

- **Mapa 2D de biomas** — Cada tema académico se posiciona en un mapa con biomas (mazmorra, bosque, ruinas, laboratorio) y coordenadas.
- **Pergaminos de estudio** — Ejemplos prácticos y material de refuerzo asociados a cada tema.
- **Jefes Finales** — Evaluaciones de opción múltiple con corrección automática, XP variable, retroalimentación por pregunta y **un solo intento** por mazmorra.
- **Misiones de Laboratorio** — Tareas con entregas textuales (y adjuntos PDF/Word en Base64) que el profesor califica y retroalimenta.
- **Sistema RPG completo** — XP, niveles, HP y títulos de clase que se recalculan automáticamente con cada calificación.
- **Ranking del Gremio** — Tabla de los mejores héroes ordenada por XP.
- **Copiloto IA (Oráculo)** — Genera preguntas, ejemplos y misiones desde un tema, con respaldo local automático si no hay clave de API.
- **Sesiones seguras en servidor** — Tokens de sesión almacenados en SQLite con cierre de sesión real.

## 📁 Estructura del proyecto

```text
proyecto_Estadistica/
├── backend/                     # API REST (Express + better-sqlite3)
│   ├── server.js                # Endpoints, motor de corrección RPG y Copiloto IA
│   ├── db.js                    # Esquema SQLite, migraciones y semillas
│   ├── .env                     # Variables opcionales (PORT, GEMINI_API_KEY)
│   └── database.sqlite          # Base de datos (se crea sola al primer arranque)
├── frontend/                    # SPA (React 19 + Vite + React Router)
│   └── src/
│       ├── App.jsx              # Rutas, header global y rutas protegidas
│       ├── context/AuthContext  # Sesión compartida entre páginas
│       └── pages/               # Home, accesos, paneles y combate de evaluación
└── database.sqlite              # Copia de trabajo de la BD en la raíz
```

## ✅ Requisitos previos

- **Node.js ≥ 20 LTS** (necesario para `fetch` nativo en el backend)
- npm (incluido con Node)

## 🚀 Instalación y ejecución

**1. Backend — API en el puerto 4000:**

```bash
cd backend
npm install
npm run dev        # desarrollo con nodemon
# ó
npm start          # producción
```

**2. Frontend — SPA en el puerto 5173:**

```bash
cd frontend
npm install
npm run dev
```

**3. Abre http://localhost:5173** — el frontend ya apunta a `http://localhost:4000` por defecto.

> [!NOTE]
> La base de datos, sus tablas y los datos semilla se crean automáticamente en el primer arranque. No hace falta configurar nada más para probar el proyecto.

## 🔑 Cuentas de demostración

| Rol | Credenciales |
|-----|--------------|
| Game Master | `admin@universidad.com` / `admin123` |
| Héroe (semillas) | Códigos `EST-LEO1`, `EST-SOF2`, `EST-ANA3` |

Los estudiantes nuevos se registran desde la app y reciben un código único `EST-XXXX` generado automáticamente.

## 🗺️ Rutas de la aplicación

| Ruta | Descripción | Protegida |
|------|-------------|-----------|
| `/` | Portada con accesos a ambos roles | No |
| `/profesor` | Login del Game Master | No |
| `/estudiante` | Acceso al Gremio por código | No |
| `/panel-profesor` | Consola del Game Master (temas, jefes, misiones, calificaciones) | Rol: profesor |
| `/panel-estudiante` | Mapa 2D, pregaminos, misiones y HUD del héroe | Rol: estudiante |
| `/evaluacion/:id` | Combate contra el Jefe Final (rendir evaluación) | Rol: estudiante |

## 🔌 API REST

Base URL: `http://localhost:4000` (configurable con `PORT`).

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/profesor` | Login de profesor (devuelve `sessionToken`) |
| `POST` | `/api/auth/estudiante` | Login de estudiante por código único |
| `POST` | `/api/auth/logout` | Cierre de sesión (elimina el token) |
| `GET` | `/api/estudiantes` | Listado del gremio ordenado por XP |
| `POST` / `DELETE` | `/api/estudiantes/:id` | Crear / eliminar estudiante |
| `GET` | `/api/gremio` | Top 8 héroes para el HUD del mapa |
| `GET` / `POST` | `/api/temas` | Listar (con ejemplos) / crear biomas-tema |
| `POST` / `DELETE` | `/api/ejemplos/:id` | Crear / eliminar pergaminos de estudio |
| `GET` / `POST` | `/api/evaluaciones` | Listar jefes / crear evaluación |
| `GET` | `/api/evaluaciones/:id/preguntas` | Preguntas sin respuestas (estudiante) |
| `GET` | `/api/evaluaciones/:id/preguntas-docente` | Preguntas con respuesta correcta (docente) |
| `POST` | `/api/evaluaciones/:id/calificar` | Motor de corrección: puntaje, XP y retroalimentación |
| `GET` | `/api/calificaciones/estudiante/:id` | Historial de combates del estudiante |
| `GET` / `POST` | `/api/tareas` | Listar / crear misiones de laboratorio |
| `GET` | `/api/tareas/:id/entregas` | Entregas de una misión (docente) |
| `POST` | `/api/entregas` | Entregar / actualizar entrega de una misión |
| `PUT` | `/api/entregas/:id/calificar` | Calificar entrega (actualiza XP del héroe) |
| `POST` | `/api/ia/asistente` | Copiloto IA: preguntas, ejemplos, misiones o chat |

## 📈 Sistema de progreso RPG

El backend recalcula automáticamente XP, nivel, HP y clase del estudiante tras cada calificación:

- **XP base de bienvenida:** 150 al ingresar al Gremio.
- **Jefes vencidos:** `puntaje% × XP de recompensa` + bonus (50 si aprueba ≥ 60 %, 15 en caso contrario).
- **Misiones calificadas:** `nota × 2` XP por entrega.
- **Niveles:** cada **250 XP** sube 1 nivel (por defecto nivel 1 con 150 XP).

| Nivel | Título de clase |
|-------|-----------------|
| 1–3 | Aprendiz / Mago de Código |
| 4–7 | Mago de Código |
| 8–11 | Hechicero Senior |
| 12+ | Archimago de Sistemas |

## 🤖 Copiloto IA (opcional)

El "Oráculo & Copiloto IA" del panel del profesor puede usar la **API de Google Gemini** para generar preguntas, ejemplos y misiones a partir de un tema.

Crea un archivo `backend/.env` con:

```env
PORT=4000
GEMINI_API_KEY=tu_api_key_aqui
```

> [!NOTE]
> La plataforma funciona **100 % sin la clave de IA**: si `GEMINI_API_KEY` no está configurada o la API falla, se activa un generador local de respaldo con plantillas didácticas prediseñadas.

## 🔒 Notas de seguridad

> [!WARNING]
> Este es un proyecto académico con fines demostrativos. Las contraseñas se almacenan **en texto plano** y las validaciones de rol dependen del frontend. No es apto para producción sin implementar hashing (bcrypt), HTTPS y validación de sesión en el backend para cada endpoint sensible.

---

Estado: **Proyecto de Evaluación Integrada — Estadística** 📊 *Pongamonos los sombreros de mago y a derrotar jefes académicos.*
