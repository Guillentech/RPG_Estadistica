# Despliegue de Saga Académica (PC y Android)

Esta guía publica la app como un servicio web HTTPS. El mismo backend sirve la API y el build de React, así que PC y Android solo necesitan abrir la URL en el navegador. La app también se puede instalar como PWA.

## Arquitectura

```text
Navegador / PWA (PC, Android)
        │ HTTPS
        ▼
Caddy o Nginx (TLS + proxy inverso)
        │ HTTP :4000
        ▼
Node.js + Express
  ├── /api/*        → API REST
  ├── /uploads/*    → adjuntos
  └── /*            → frontend/dist (SPA con fallback)
        │
        ▼
Volumen persistente
  ├── database.sqlite
  └── uploads/
```

## Requisitos

- Node.js ≥ 20 (el `Dockerfile` usa Node 22).
- Un dominio o subdominio apuntando al servidor.
- HTTPS (Caddy lo gestiona automáticamente con Let's Encrypt).
- Un volumen persistente para SQLite y los uploads.
- Opcional: Docker + Docker Compose.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto de Express | `4000` |
| `CORS_ORIGIN` | Orígenes permitidos, separados por comas. Vacío = abierto (solo desarrollo) | `https://app.tudominio.com` |
| `GEMINI_API_KEY` | Clave opcional del Copiloto IA | `...` |
| `DB_PATH` | Ruta de SQLite | `/data/database.sqlite` |
| `UPLOADS_DIR` | Carpeta de adjuntos | `/data/uploads` |

### Frontend (`frontend/.env` o variable de build)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL del backend. Vacío = mismo origen (`/api/...`) | `https://api.tudominio.com` |

> `VITE_API_URL` se incrusta en el build. Si cambias la URL de la API, vuelve a ejecutar `npm run build`.

## Build y ejecución local

```powershell
npm run setup
npm run lint
npm --prefix frontend test
npm run build
npm start
```

Abre `http://localhost:4000`. El backend sirve el build de `frontend/dist`.

Para desarrollo con recarga en caliente sigue usando:

```powershell
npm run dev
```

## Opción A: Docker + Caddy (recomendada)

### 1. Preparar el servidor

```bash
mkdir -p /opt/saga-academica/data
cd /opt/saga-academica
# Copia el repositorio o clónalo aquí.

# El contenedor corre como usuario node (UID 1000). Dale permiso sobre el volumen.
sudo chown -R 1000:1000 data
```

### 2. Configurar variables

Crea un archivo `.env` junto a `docker-compose.yml`:

```env
CORS_ORIGIN=https://app.tudominio.com
GEMINI_API_KEY=
```

### 3. Levantar la app

```bash
docker compose up -d --build
docker compose logs -f app
```

La app escucha en `127.0.0.1:4000`. Verifica:

```bash
curl http://127.0.0.1:4000/api/health
```

### 4. Configurar HTTPS con Caddy

Copia `deploy/Caddyfile`, cambia `app.tudominio.com` por tu dominio y ejecuta Caddy en el host:

```bash
caddy run --config deploy/Caddyfile
```

Caddy obtiene el certificado TLS automáticamente.

### 5. Persistencia

`docker-compose.yml` monta `./data:/data`:

- SQLite: `./data/database.sqlite`
- Uploads: `./data/uploads/`

No borres `./data` al actualizar. Para hacer backup:

```bash
docker compose stop app
cp data/database.sqlite "data/database.backup-$(date +%Y%m%d-%H%M%S).sqlite"
tar -czf "data/uploads-backup-$(date +%Y%m%d).tar.gz" data/uploads
docker compose start app
```

Restauración:

```bash
docker compose stop app
cp data/database.backup-AAAAMMDD-HHMMSS.sqlite data/database.sqlite
docker compose start app
```

## Opción B: Node directo + Nginx

```bash
npm run setup
npm run build
PORT=4000 DB_PATH=/var/lib/saga/database.sqlite UPLOADS_DIR=/var/lib/saga/uploads node backend/server.js
```

Nginx de ejemplo:

```nginx
server {
    listen 443 ssl;
    server_name app.tudominio.com;

    # Necesario para los adjuntos Base64 y PDFs/Word.
    client_max_body_size 60m;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## PWA: instalar en Android y PC

1. Abre `https://app.tudominio.com` en Chrome (Android) o Edge/Chrome (PC).
2. Android: menú → **Agregar a pantalla de inicio** / **Instalar app**.
3. PC: icono de instalación en la barra de direcciones → **Instalar**.
4. La PWA requiere HTTPS (excepto `localhost`).

El service worker cachea el shell de la app. Las llamadas `/api/` y `/uploads/` usan `NetworkOnly` para no mostrar datos viejos.

## Actualizar la app

```bash
git pull
docker compose up -d --build
```

La base de datos y los uploads se conservan en `./data`.

## Rollback

```bash
git log --oneline
git checkout <commit-anterior>
docker compose up -d --build
```

Si el problema es de datos, restaura el backup de SQLite y reinicia.

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| La app carga pero las llamadas fallan | `VITE_API_URL` incorrecta o CORS | Revisa la consola del navegador y `CORS_ORIGIN`. |
| 404 al recargar una ruta | Falta fallback SPA | Usa el backend actualizado que sirve `index.html`, o configura rewrites en el hosting. |
| `SQLITE_CANTOPEN` | Ruta o permisos del volumen | Verifica `DB_PATH`, que `/data` exista y sea escribible. |
| No se pueden subir archivos | Límite proxy o permisos | `client_max_body_size 60m` y revisa `UPLOADS_DIR`. |
| La PWA no se instala | Falta HTTPS o manifest | Usa HTTPS y valida el manifest en DevTools → Application. |
| `better-sqlite3` no carga | Node/distrolib incompatibles | Usa la imagen Docker o `npm rebuild better-sqlite3`. |
| CORS bloquea el APK | Origen `https://localhost` no permitido | Añade `https://localhost` a `CORS_ORIGIN`. |

## Checklist de salida a producción

- [ ] `npm run lint`, `npm --prefix frontend test` y `npm run build` pasan.
- [ ] No quedan `localhost:4000` fuera de `frontend/src/config.js`.
- [ ] `https://app.tudominio.com` carga con certificado válido.
- [ ] `/api/health` responde `{ "ok": true }`.
- [ ] Recargar `/panel-estudiante` no da 404.
- [ ] Login de profesor y estudiante funciona.
- [ ] Subida de PDF/Word funciona.
- [ ] Los datos persisten tras `docker compose restart`.
- [ ] Backup de SQLite y uploads probado.
- [ ] PWA instalable en Android y PC.
- [ ] `CORS_ORIGIN` restringido al dominio real.
- [ ] Credenciales de demostración cambiadas antes de exponer la app públicamente.
