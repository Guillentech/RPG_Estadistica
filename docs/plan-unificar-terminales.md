# Plan: unificar el arranque de frontend y backend en una sola terminal

**Proyecto:** Saga Académica (`proyecto_Estadistica`)
**Objetivo:** arrancar React (Vite) y Node.js (Express + nodemon) con **un único comando** desde la raíz del repositorio, viendo ambos logs en la misma terminal y deteniendo ambos procesos con un solo `Ctrl+C`.
**Herramienta recomendada:** `concurrently`.
**Estado:** implementado y verificado (2026-10-23).

---

## 1. Resultado esperado

```powershell
# Desde C:\Proyecto_EI\proyecto_Estadistica
npm run dev
```

Salida esperada (ejemplo):

```
[backend]  🚀 Servidor Saga Académica corriendo en http://localhost:4000
[frontend] VITE v8.3.0  ready in 320 ms
[frontend] ➜  Local:   http://localhost:5173/
```

Un solo `Ctrl+C` debe terminar Vite, nodemon y el proceso de Node del backend.

---

## 2. Estado actual (evidencia)

| Elemento | Situación |
|---|---|
| Raíz del repo | Tiene `package-lock.json` **vacío** (`"packages": {}`) y **no tiene** `package.json`. |
| Backend | `backend/package.json` con `"dev": "nodemon server.js"` y `"start": "node server.js"`. Puerto `process.env.PORT \|\| 4000` (`backend/server.js:10`). |
| Frontend | `frontend/package.json` con `"dev": "vite"`. Vite usa su puerto por defecto (5173). |
| API | El frontend llama directamente a `http://localhost:4000` (hardcodeado en varios componentes). El backend habilita `cors()` abierto. |
| Instalaciones | `node_modules` **separados** en `backend/` y `frontend/`; no hay workspaces. |
| Entorno | Node `v24.22.0`, npm `11.19.1` (Windows). |
| `.gitignore` | Ya ignora `node_modules`, `dist` y `backend/.env`. |

Consecuencia: hoy se requieren dos terminales (`cd backend && npm run dev` y `cd frontend && npm run dev`). No hay que tocar la lógica de la aplicación para unificarlas.

> [!NOTE]
> Estado actualizado tras la implementación: existe `package.json` en la raíz con los scripts de arranque y `package-lock.json` ya está poblado (21 paquetes). Lo descrito en la tabla es el punto de partida original.

---

## 3. Decisiones de diseño

### 3.1 `concurrently` vs `npm-run-all`

| Criterio | `concurrently` (elegido) | `npm-run-all` / `npm-run-all2` |
|---|---|---|
| Mantenimiento | Activo, muy usado | `npm-run-all` original está poco mantenido; existe el fork `npm-run-all2` |
| Logs | Prefijos por proceso (`[backend]`, `[frontend]`) y colores | Sin prefijos por defecto; salida más difícil de leer al mezclarse |
| Matar procesos | `-k` / `--kill-others` y `--kill-others-on-fail` | `run-p -r` / `--race` |
| Windows | Buen manejo del árbol de procesos | Correcto, pero con menos control de ciclo de vida |
| Configuración | Un script, sin dependencias extra en cada subproyecto | Requiere scripts intermedios `dev:*` en la raíz |

**Decisión:** `concurrently` como dependencia de desarrollo **solo en la raíz**. No se instala nada dentro de `backend/` ni `frontend/`, así que no se alteran sus `package-lock.json` ni sus `node_modules`.

### 3.2 Qué NO hacer

- **No usar npm workspaces.** Mover `node_modules` a la raíz puede forzar la recompilación de `better-sqlite3` (módulo nativo) y romper una instalación que ya funciona. Además, el objetivo es solo el arranque conjunto, no reorganizar el monorepo.
- **No cambiar los puertos ni el código del frontend.** La API ya apunta a `localhost:4000`, que es el puerto por defecto del backend.
- **No añadir `wait-on` ni healthchecks** en esta fase; se pueden agregar después si se necesita abrir el navegador automáticamente o esperar al backend.
- **No tocar** `backend/.env`, la base de datos ni `frontend/vite.config.js`.

### 3.3 Semántica de parada

Se usará `-k` (`--kill-others`): si cualquiera de los dos procesos termina, se termina el otro. Es el comportamiento correcto para un entorno de desarrollo de una sola terminal:

- `Ctrl+C` → `concurrently` propaga la señal a ambos hijos y, en Windows, mata el árbol de procesos.
- Si Vite falla al arrancar (por ejemplo, puerto ocupado), el backend no queda huérfano.
- Si el backend no puede arrancar, Vite se cierra en vez de quedar como proceso zombie.

> Nota: `nodemon` **no** sale cuando la app lanza una excepción; se queda esperando cambios. Por eso `-k` no interrumpe el flujo normal de recarga. Si se prefiere que Vite sobreviva a fallos del backend, usar `--kill-others-on-fail` en su lugar.

---

## 4. Arquitectura de la solución

```
proyecto_Estadistica/
├── package.json          ← NUEVO: scripts raíz + concurrently (devDependency)
├── package-lock.json     ← se actualiza con npm install
├── .gitignore            ← sin cambios (ya ignora node_modules)
├── backend/              ← sin cambios
│   ├── package.json
│   └── server.js         ← puerto 4000
├── frontend/             ← sin cambios
│   ├── package.json
│   └── vite.config.js    ← puerto 5173 (por defecto)
└── docs/
    └── plan-unificar-terminales.md  ← este documento
```

Flujo:

```
npm run dev (raíz)
   └── concurrently -k
        ├── npm --prefix backend  run dev  →  nodemon server.js  →  :4000
        └── npm --prefix frontend run dev  →  vite               →  :5173
```

---

## 5. Cambios concretos

### 5.1 Crear `package.json` en la raíz

Contenido propuesto:

```json
{
  "name": "proyecto-estadistica",
  "private": true,
  "version": "1.0.0",
  "description": "Saga Académica — LMS gamificado (React + Node.js)",
  "scripts": {
    "dev": "concurrently -k -n backend,frontend -c blue,magenta \"npm --prefix backend run dev\" \"npm --prefix frontend run dev\"",
    "dev:backend": "npm --prefix backend run dev",
    "dev:frontend": "npm --prefix frontend run dev",
    "start": "npm --prefix backend start",
    "build": "npm --prefix frontend run build",
    "lint": "npm --prefix frontend run lint",
    "setup": "npm --prefix backend install && npm --prefix frontend install"
  },
  "devDependencies": {
    "concurrently": "^10.0.6"
  }
}
```

Notas:

- La versión de `concurrently` la resolvió npm en tiempo de instalación: **10.0.6**. No se fijó a mano (el plan original suponía `^9.0.0`, ya desactualizado).
- `npm --prefix backend run dev` funciona igual en PowerShell, CMD y Git Bash. Evita `cd backend && ...`, que depende del shell y ensucia rutas relativas.
- `dev:backend` y `dev:frontend` permiten seguir levantando cada mitad por separado si hace falta depurar.
- `setup` es útil para un clon nuevo del repositorio. No se usa como `postinstall` para evitar invocaciones recursivas de npm.
- No se agrega `"type": "module"` en la raíz: los scripts son comandos de npm, no código JS. Añadirlo no aporta nada y podría confundir a herramientas futuras.

### 5.2 `.gitignore`

**Sin cambios.** Ya contiene `node_modules`, por lo que el nuevo `node_modules/` de la raíz (solo `concurrently` y sus dependencias) no se versiona.

### 5.3 `package-lock.json` de la raíz

Hoy está vacío (`"packages": {}`). Al instalar `concurrently` se poblará y su `name` se alineará con el nuevo `package.json`. **Se debe commitear** para reproducibilidad.

### 5.4 Archivos que NO se modifican

- `backend/package.json`, `backend/server.js`, `backend/db.js`
- `frontend/package.json`, `frontend/vite.config.js`
- Cualquier componente de `frontend/src/**`
- `backend/.env` (contiene secretos; no se lee, no se toca)

---

## 6. Pasos de implementación

### Fase 0 — Verificar el estado de partida (2 min)

```powershell
cd C:\Proyecto_EI\proyecto_Estadistica
git status --short
node --version    # v24.x esperado
npm --version     # 11.x esperado
```

Criterio: el árbol debe estar limpio o solo con cambios conocidos. Si hay trabajo sin commitear, commitear o guardar antes de empezar.

### Fase 1 — Crear el `package.json` raíz (5 min)

1. Crear el archivo con el contenido de la sección 5.1.
2. Verificar que es JSON válido:

```powershell
node -e "console.log(require('./package.json').name)"
```

### Fase 2 — Instalar `concurrently` (5 min)

```powershell
cd C:\Proyecto_EI\proyecto_Estadistica
npm install --save-dev concurrently
```

Esto:

- crea `node_modules/` en la raíz (ignorado por git),
- actualiza `package.json` con la versión resuelta,
- actualiza `package-lock.json` de la raíz.

Verificar:

```powershell
npx concurrently --version
```

**No** ejecutar `npm install` dentro de `backend/` ni `frontend/`: sus dependencias ya están instaladas.

### Fase 3 — Primera prueba manual (10 min)

```powershell
npm run dev
```

Comprobar:

1. Aparecen logs con prefijo `[backend]` y `[frontend]`.
2. Backend escucha en `http://localhost:4000`.
3. Vite muestra su URL local (normalmente `http://localhost:5173`).
4. `Ctrl+C` una sola vez detiene ambos procesos y devuelve el prompt.

### Fase 4 — Prueba funcional (10 min)

Con `npm run dev` corriendo, en otra terminal **solo para verificar**:

```powershell
# El backend responde (ruta existente en server.js)
Invoke-RestMethod http://localhost:4000/api/temas | ConvertTo-Json -Depth 3

# El frontend sirve HTML
(Invoke-WebRequest http://localhost:5173).StatusCode
```

Luego abrir el navegador en `http://localhost:5173`, iniciar sesión y comprobar que las llamadas a la API funcionan (DevTools → Network, sin errores CORS).

### Fase 5 — Commit (5 min)

```powershell
git add package.json package-lock.json docs/plan-unificar-terminales.md
git commit -m "chore(dev): unificar arranque de frontend y backend con concurrently"
```

No incluir `node_modules/` (ya está ignorado).

---

## 7. Criterios de aceptación

| # | Criterio | Cómo verificarlo |
|---|---|---|
| 1 | Un solo comando arranca ambos servicios | `npm run dev` desde la raíz |
| 2 | Los logs se distinguen por servicio | Prefijos `[backend]` / `[frontend]` y colores |
| 3 | Backend en `:4000` | `Invoke-RestMethod http://localhost:4000/api/temas` |
| 4 | Frontend en `:5173` | Abrir la URL que imprime Vite |
| 5 | `Ctrl+C` detiene todo | No quedan procesos `node` escuchando en 4000/5173 |
| 6 | Recarga en caliente sigue funcionando | Guardar un archivo de `backend/` → nodemon reinicia; guardar uno de `frontend/src/` → HMR de Vite |
| 7 | No se modificó la app | `git diff --stat` solo muestra raíz + docs |
| 8 | Instalación reproducible | `npm ci` en la raíz funciona con el lockfile |

Verificación de procesos huérfanos en Windows:

```powershell
Get-NetTCPConnection -LocalPort 4000,5173 -ErrorAction SilentlyContinue |
  Select-Object LocalPort, State, OwningProcess
```

Debe devolver vacío después de `Ctrl+C`.

---

## 8. Uso diario

```powershell
# Arrancar todo
npm run dev

# Solo backend (depuración)
npm run dev:backend

# Solo frontend
npm run dev:frontend

# Producción del backend (sin nodemon)
npm start

# Build del frontend
npm run build

# Instalación completa en un clon nuevo
npm run setup
```

---

## 9. Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Puerto 4000 ocupado | Media | `Get-NetTCPConnection -LocalPort 4000`; cerrar el proceso o definir `PORT` en `backend/.env` |
| Puerto 5173 ocupado | Media | Vite elige 5174 automáticamente; si se necesita fijo, añadir `server: { port: 5173, strictPort: true }` en `frontend/vite.config.js` (fuera de alcance) |
| `Ctrl+C` deja nodemon vivo en Windows | Baja | `concurrently -k` mata el árbol; si persiste, `taskkill /PID <pid> /T /F` |
| `better-sqlite3` falla al cargar tras cambiar de versión de Node | Baja | `npm --prefix backend rebuild better-sqlite3`; requiere toolchain de compilación si no hay prebuild |
| `npm --prefix` no encuentra el script | Muy baja | Verificar `npm --prefix backend run` y la versión de npm; alternativa: `cd backend && npm run dev` dentro del script |
| Logs mezclados / difíciles de leer | Baja | Ya mitigado con `-n` y `-c`; se puede añadir `--timestamp` |
| El lockfile raíz vacío provoca ruido en el diff | Baja | Commitear el lockfile actualizado junto con el `package.json` |
| `concurrently` se instala en la raíz y no en subproyectos | Ninguno | Es intencional: una sola dependencia de desarrollo, sin tocar los subproyectos |

---

## 10. Alternativa con `npm-run-all`

Si se prefiere evitar `concurrently`, usar el fork mantenido **`npm-run-all2`** (el paquete `npm-run-all` original está poco mantenido).

`package.json` raíz alternativo:

```json
{
  "name": "proyecto-estadistica",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "run-p --race dev:backend dev:frontend",
    "dev:backend": "npm --prefix backend run dev",
    "dev:frontend": "npm --prefix frontend run dev"
  },
  "devDependencies": {
    "npm-run-all2": "^8.0.0"
  }
}
```

Instalación:

```powershell
npm install --save-dev npm-run-all2
```

Diferencias:

- `run-p --race` (equivalente a `-r`) termina todos los procesos cuando uno termina.
- **No** hay prefijos `[backend]`/`[frontend]` por defecto: los logs se mezclan. Se puede compensar con `--prefix` si la versión lo soporta, pero la salida sigue siendo menos clara que la de `concurrently`.
- Para este proyecto, `concurrently` sigue siendo la opción recomendada.

---

## 11. Rollback

Si algo falla, revertir es trivial y no afecta a la aplicación:

```powershell
# Opción A: deshacer el commit
git revert <hash-del-commit>

# Opción B: eliminar solo lo añadido (si aún no se commiteó)
Remove-Item package.json
Remove-Item node_modules -Recurse -Force
git checkout -- package-lock.json
```

`backend/` y `frontend/` no se tocan en ningún paso, por lo que el arranque por separado sigue funcionando exactamente igual que antes.

---

## 12. Fuera de alcance / mejoras futuras

1. **Proxy de Vite** (`server.proxy`) para dejar de hardcodear `http://localhost:4000` en los componentes y usar rutas relativas `/api/...`.
2. **Variable `VITE_API_URL`** en `frontend/.env` para configurar la URL de la API por entorno.
3. **`wait-on` + `open`** para esperar al backend y abrir el navegador automáticamente.
4. **Healthcheck** `GET /api/health` en el backend para verificar disponibilidad.
5. **npm workspaces** si el proyecto crece a más paquetes; requiere planificar la recompilación de `better-sqlite3`.
6. **Scripts de CI** que reutilicen `setup`, `lint` y `build`.

Ninguna de estas mejoras es necesaria para cumplir el objetivo de este plan.

---

## 13. Checklist de ejecución

- [x] `git status` revisado (había un cambio ajeno en `backend/server.js`, no incluido)
- [x] Crear `package.json` raíz (sección 5.1) — script de instalación renombrado a `setup`
- [x] `npm install --save-dev concurrently` → **10.0.6**
- [x] `npx concurrently --version` responde `10.0.6`
- [x] `npm run dev` arranca ambos servicios con prefijos `[backend]` / `[frontend]`
- [x] Backend responde en `:4000` (`GET /api/temas` → JSON)
- [x] Frontend responde en `:5173` (HTTP 200)
- [x] Reinicio de nodemon y recarga de Vite funcionan sin tumbar el otro proceso
- [x] `-k` / cierre del árbol deja los puertos libres, sin procesos huérfanos
- [x] `npm ci` funciona en la raíz (lockfile poblado)
- [x] `README.md` actualizado al flujo de una sola terminal

---

## 14. Resultado de la verificación (2026-10-23)

| Comprobación | Resultado |
|---|---|
| `npm run dev` (raíz) | `[backend]` y `[frontend]` con prefijos y colores; sin errores |
| Backend | `GET /api/temas` → JSON válido; proceso `node server.js` en `:4000` |
| Frontend | `GET /` → `200`; Vite v8.3.4 en `:5173` |
| **cwd del backend** | `dotenv` cargó **2 variables desde `.env`** y la BD se abrió en `backend/database.sqlite`: `npm --prefix backend run dev` ejecuta el script con cwd = `backend/`. Sin archivos creados en la raíz |
| Kill-others (`-k`) | Al terminar el proceso de Vite, `concurrently` envió SIGTERM al backend y ambos salieron |
| Cierre del árbol | `taskkill /T /F` sobre el proceso raíz → puertos `4000`/`5173` libres y cero procesos `node` huérfanos |
| nodemon | Reinició al crear/eliminar un archivo en `backend/` sin afectar a Vite |
| Vite (watch/HMR) | Sirvió de inmediato el módulo modificado en `frontend/src/` y volvió al original tras revertir, con `:5173` siempre en 200 |
| Cambios en la app | Ninguno: `git status` solo muestra `package.json`, `package-lock.json`, `README.md` y `docs/` |

> [!NOTE]
> La prueba con un `Ctrl+C` físico no es reproducible desde un shell no interactivo (no hay consola en primer plano que reciba el evento). La semántica equivalente se validó por dos vías: `-k` (al morir un hijo muere el otro) y cierre del árbol completo sin huérfanos. En una terminal real, `concurrently` con `-k` propaga el `Ctrl+C` a ambos hijos.
