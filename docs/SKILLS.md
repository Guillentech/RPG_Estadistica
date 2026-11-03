# Skills de OpenCode (Saga Académica)

Set curado de skills instaladas **a nivel global** en
`~/.config/opencode/skills/` (`C:\Users\<usuario>\.config\opencode\skills` en Windows).
Se descubren automáticamente en todos los proyectos y se cargan **solo cuando la tarea
las necesita**, así que no consumen contexto de forma permanente.

## Instaladas

| ID | Origen | Para qué sirve |
| --- | --- | --- |
| `grilling` | mattpocock/skills | Interroga el plan/idea hasta que no queden supuestos ocultos. |
| `grill-me` | mattpocock/skills | Atajo que invoca `grilling`. |
| `tdd` | mattpocock/skills | Red → green → refactor, con guías de tests y mocks. |
| `code-review` | mattpocock/skills | Revisión en dos ejes (estándares del repo vs. spec) con subagentes en paralelo. |
| `handoff` | mattpocock/skills | Compacta la sesión en un documento para continuar en otra sesión/agente. |
| `systematic-debugging` | obra/superpowers | Causa raíz antes de tocar código; prohibido parchear síntomas. |
| `verification-before-completion` | obra/superpowers | Exige evidencia (comando + salida) antes de decir "listo". |
| `vercel-react-best-practices` | vercel-labs/agent-skills | 57 reglas de rendimiento React/Next (waterfalls, bundle, re-renders). |
| `web-design-guidelines` | vercel-labs/agent-skills | Auditoría de a11y/UX contra las Web Interface Guidelines. |
| `frontend-design` | anthropics/skills | Dirección visual intencional; evita el "AI slop". |
| `security-review` | affaan-m/ECC | Checklist de secretos, auth, input, endpoints y pagos. |
| `skill-creator` | anthropics/skills | Crear/editar/medir skills propias del proyecto. |
| `ui-ux-pro-max` | nextlevelbuilder/ui-ux-pro-max-skill | Jerarquía visual, paletas, tipografías, guías UX y recomendaciones por stack. Trae un buscador local en Python. |
| `ui-styling` | nextlevelbuilder (mismo paquete) | shadcn/ui + Tailwind 4, temas, dark mode, componentes accesibles. |
| `design-system` | nextlevelbuilder (mismo paquete) | Tokens en tres capas (primitive → semantic → component) y especificación de componentes. |
| `design` | nextlevelbuilder (mismo paquete) | Logo, identidad corporativa, iconos, banners y social photos. |
| `brand` | nextlevelbuilder (mismo paquete) | Voz de marca, identidad visual y consistencia de assets. |
| `banner-design` | nextlevelbuilder (mismo paquete) | Banners por plataforma y formato (web, social, print). |
| `slides` | nextlevelbuilder (mismo paquete) | Presentaciones HTML con Chart.js y tokens de diseño. |

## Cuándo usar cada una

- **Antes de implementar**: `grilling` → `tdd`.
- **Al terminar**: `code-review` → `verification-before-completion`.
- **Algo se rompe**: `systematic-debugging`.
- **UI/UX**: `ui-ux-pro-max` (dirección y datos) + `frontend-design` (evitar el "AI slop") + `ui-styling` (Tailwind/shadcn) + `web-design-guidelines` (auditoría) + `vercel-react-best-practices` (rendimiento).
- **Tokens o tema nuevo**: `design-system`.
- **Auth, XP, endpoints de alumno/profesor**: `security-review`.
- **Sesión larga**: `handoff`.
- **Skill nueva del dominio (ej. motor de corrección RPG)**: `skill-creator`.

Se pueden invocar explícitamente con `@id` en el prompt (por ejemplo `@tdd`).

### `ui-ux-pro-max`: buscador local

La skill trae una base de datos local y un script de búsqueda. **En Windows el comando es `python`, no `python3`** (Python 3.15 está instalado y verificado en esta máquina):

```powershell
# Sistema de diseño completo (patrón + estilo + colores + tipografía + anti-patrones)
python "$env:USERPROFILE\.config\opencode\skills\ui-ux-pro-max\scripts\search.py" "gamified LMS dashboard" --design-system -p "Saga Academica"

# Consultas puntuales
python "$env:USERPROFILE\.config\opencode\skills\ui-ux-pro-max\scripts\search.py" "pixel art retro" --domain style
python "$env:USERPROFILE\.config\opencode\skills\ui-ux-pro-max\scripts\search.py" "badge overflow nowrap" --domain ux
python "$env:USERPROFILE\.config\opencode\skills\ui-ux-pro-max\scripts\search.py" "responsive layout" --stack react
```

Salida real para este proyecto (`"gamified LMS academic RPG dashboard"`):

- Estilo: **Flat Design** (2D, minimalista, icon-heavy) — coherente con el mapa de sprites.
- Colores: primario `#0D9488`, acento `#D97706`, fondo `#F0FDFA`, texto `#134E4A`.
- Tipografía: **Crimson Pro / Atkinson Hyperlegible** (académica y legible).

Es orientativo, no una orden: el HUD del juego manda sobre la estética y las tablas académicas mandan sobre el contraste.

> Las otras seis skills del paquete (`ui-styling`, `design-system`, `design`, `brand`, `banner-design`, `slides`) se instalaron junto con `ui-ux-pro-max`. Algunas asumen la versión premium del proyecto (branding, logos, banners) y pueden pedir APIs externas; si no las usas, bórralas de `~/.config/opencode/skills/`.

## Servidores MCP

Configuración global en `~/.config/opencode/opencode.jsonc`, bajo `mcp.servers`.
OpenCode recarga la configuración al guardar; no hace falta reiniciar.

| Servidor | Estado | Para qué sirve |
| --- | --- | --- |
| `playwright` | **Activo, verificado** | Abrir `localhost`, hacer clic, tomar capturas y detectar si el HUD o un cuadro de diálogo se desborda. |
| `figma` | **Inactivo** (falta clave) | Lee nodos, medidas y estilos de un archivo de Figma y los traduce a componentes. |
| `21st` | **Inactivo** (falta clave) | Busca e instala componentes React del catálogo de 21st.dev (antes "Magic"). |

Verificación hecha en esta máquina: `mcp connected server=playwright tools=33` en
`~/.local/share/opencode/log/opencode.log`, más una navegación real
(`playwright_navigate` → `playwright_get_visible_text` → `playwright_close`).

### Por qué no se usa `npx` en tiempo de ejecución

La primera versión lanzaba los servidores con `npx -y ...`. Falló: cada sesión y cada
directorio de OpenCode arrancan su propia instancia, y varias instalaciones simultáneas
en la misma carpeta de caché de npm se pisan (`ENOTEMPTY`, `EPERM`, `Request timed out`).

Solución aplicada: los paquetes están preinstalados una sola vez y el servidor se lanza
con `node` sobre su entrypoint.

```text
~/.config/opencode/mcp/
├── playwright/   # @executeautomation/playwright-mcp-server → dist/index.js
└── figma/        # figma-developer-mcp → dist/bin.js
```

Para reinstalar o actualizar:

```powershell
$base = "$env:USERPROFILE\.config\opencode\mcp"
npm --prefix "$base\playwright" install @executeautomation/playwright-mcp-server@latest
node "$base\playwright\node_modules\playwright\cli.js" install chromium
npm --prefix "$base\figma" install figma-developer-mcp@latest
```

### Activar Figma y 21st.dev

`@21st-dev/magic` ya **no** es el paquete recomendado: npm lo publica solo como proxy de
compatibilidad para configuraciones viejas. El servidor actual es remoto
(`https://21st.dev/api/mcp`) y se autentica con la cabecera `x-api-key`; eso es lo que
está configurado.

Las claves nunca se escriben en el archivo: se leen de variables de entorno.

```powershell
setx FIGMA_API_KEY "figd_..."   # https://help.figma.com/hc/en-us/articles/8085703771159
setx 21ST_API_KEY "..."         # https://21st.dev/mcp
```

Cierra y vuelve a abrir la terminal, y luego quita `"disabled": true` del servidor
correspondiente en `opencode.jsonc`. Comprueba el estado con `/mcps` dentro de OpenCode.

### Detalles de Windows

- El `--stdio` de `figma-developer-mcp` es obligatorio.
- `figma-developer-mcp` lee `FIGMA_API_KEY` del entorno; sin ella aborta con
  *"Either FIGMA_API_KEY or FIGMA_OAUTH_TOKEN is required"*.
- Los navegadores de Playwright quedan en `%LOCALAPPDATA%\ms-playwright` (Chromium,
  Firefox y WebKit ya descargados).
- `node` se resuelve como `node.exe`; `npx` no, porque es `npx.cmd` y necesita `cmd /c`.

### Solapamiento con el navegador integrado

OpenCode ya trae herramientas de navegador (abrir pestañas, capturas, consola, red).
`playwright` añade control más fino y grabación de tests, pero ocupa contexto: si no lo
usas, ponlo en `"disabled": true` o bórralo del archivo.

## Comandos globales

Además de las skills, hay comandos globales en `~/.config/opencode/commands/`:

| Comando | Archivo | Para qué sirve |
| --- | --- | --- |
| `/plan` | `~/.config/opencode/commands/plan.md` | Reformula requisitos, ancla en patrones del repo, lista riesgos y espera confirmación. |
| `/plan-prd` | `~/.config/opencode/commands/plan-prd.md` | Genera un PRD centrado en el problema (`docs/prds/`) antes de planificar. |
| `/prp-plan` | `~/.config/opencode/commands/prp-plan.md` | Plan profundo con análisis de código y extracción de patrones (`docs/plans/`). |
| `/prp-implement` | `~/.config/opencode/commands/prp-implement.md` | Ejecuta un plan paso a paso con bucles de validación y genera informe (`docs/reports/`). |
| `/build-fix` | `~/.config/opencode/commands/build-fix.md` | Detecta el sistema de build y corrige errores de tipos de forma incremental. |
| `/code-review` | `~/.config/opencode/commands/code-review.md` | Revisa cambios locales o un PR de GitHub contra 7 categorías. |
| `/pr` | `~/.config/opencode/commands/pr.md` | Crea un PR de GitHub analizando commits, plantillas y cambios. |
| `/prp-pr` | `~/.config/opencode/commands/prp-pr.md` | Alias de `/pr` para el flujo PRP. |

Uso:

```text
/plan-prd "Sistema de combate por turnos con modificadores de estadística"
/plan docs/prds/sistema-combate.prd.md
/prp-plan "Añadir cálculo de crítico en backend"
/prp-implement docs/plans/anadir-calculo-de-critico-en-backend.plan.md
/build-fix
/code-review
/pr
```

Adaptados de `affaan-m/ECC` (MIT). Diferencias con el original:
- Ejecutan inline o mediante subagentes nativos de OpenCode (`planner`, `code-reviewer`, `build-error-resolver`).
- Los artefactos se guardan en `docs/` (`docs/prds/`, `docs/plans/`, `docs/reports/`, `docs/reviews/`) en lugar de `.claude/`.
- Toda la interacción y los mensajes son en español.

## Agentes globales

En `~/.config/opencode/agents/`:

| Agente | Modo | Rol |
| --- | --- | --- |
| `planner` | subagent | Especialista en planificación y descomposición sin tocar código. |
| `code-reviewer` | subagent | Revisor estricto de seguridad, tipos y calidad de código. |
| `build-error-resolver` | subagent | Arregla errores de compilación y de tipos con diffs mínimos. |

Para crear más comandos, añade un `.md` en `~/.config/opencode/commands/`: el cuerpo es
la plantilla del prompt y `$ARGUMENTS` se sustituye por lo que escribas tras el comando.

## Licencias y procedencia

| Repo | Licencia |
| --- | --- |
| mattpocock/skills | MIT |
| obra/superpowers | MIT |
| vercel-labs/agent-skills | MIT (declarada en el frontmatter de cada skill) |
| anthropics/skills | Apache 2.0 (los `LICENSE.txt` se conservan junto a cada skill) |
| affaan-m/ECC | MIT |
| nextlevelbuilder/ui-ux-pro-max-skill | MIT |

Los archivos se copiaron sin modificar, salvo `grill-me` y `handoff`, a los que se les quitó
`disable-model-invocation: true` para que OpenCode pueda anunciarlas al modelo.

Del paquete `ui-ux-pro-max` solo se cambió una cosa: las rutas internas de `SKILL.md`
apuntaban a `~/.opencode/skills/`, que **no** es una carpeta que OpenCode descubra. El
instalador deja ahí las skills, así que hay que moverlas a `~/.config/opencode/skills/`
y reescribir esas rutas:

```powershell
npx -y ui-ux-pro-max-cli@latest init --ai opencode --global
$dst = "$env:USERPROFILE\.config\opencode\skills"
Get-ChildItem "$env:USERPROFILE\.opencode\skills" -Directory | ForEach-Object {
  Move-Item $_.FullName "$dst\$($_.Name)" -Force
}
Remove-Item "$env:USERPROFILE\.opencode" -Recurse -Force
$f = "$dst\ui-ux-pro-max\SKILL.md"
(Get-Content -Raw $f) -replace '~/\.opencode/skills/', '~/.config/opencode/skills/' | Set-Content -NoNewline $f
```

## Actualizar

```powershell
$src = "$env:TEMP\ecc-skills-src"
git clone --depth 1 --filter=blob:none --sparse https://github.com/mattpocock/skills.git "$src\mattpocock"
git -C "$src\mattpocock" sparse-checkout set skills/productivity/grill-me skills/productivity/grilling skills/productivity/handoff skills/engineering/tdd skills/engineering/code-review
Copy-Item -Recurse -Force "$src\mattpocock\skills\productivity\grilling" "$env:USERPROFILE\.config\opencode\skills\grilling"
# ... repetir por cada skill, o volver a ejecutar el script de instalación
```

## Ámbito

- **Global (actual)**: `~/.config/opencode/skills/` — todas las skills de esta lista.
- **Proyecto (opcional)**: `.opencode/skills/` — úsalo solo para skills específicas del
  repo. Si un ID se repite, gana la versión del proyecto.

## Añadir más skills

1. Crear `~/.config/opencode/skills/<id>/SKILL.md` (o copiar la carpeta de origen).
2. La `description` es la que decide cuándo se activa: escríbela como regla de enrutado.
3. Tener una skill = un trabajo, `SKILL.md` delgado y material de apoyo en archivos aparte.
4. Auditar cualquier script incluido antes de usarlo.

Evitar duplicar IDs entre `~/.config/opencode/skills` y `.opencode/skills`: gana la fuente
registrada más tarde, lo que puede cargar la versión equivocada.
