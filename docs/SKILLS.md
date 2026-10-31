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

## Cuándo usar cada una

- **Antes de implementar**: `grilling` → `tdd`.
- **Al terminar**: `code-review` → `verification-before-completion`.
- **Algo se rompe**: `systematic-debugging`.
- **UI/UX**: `frontend-design` (dirección) + `web-design-guidelines` (auditoría) + `vercel-react-best-practices` (rendimiento).
- **Auth, XP, endpoints de alumno/profesor**: `security-review`.
- **Sesión larga**: `handoff`.
- **Skill nueva del dominio (ej. motor de corrección RPG)**: `skill-creator`.

Se pueden invocar explícitamente con `@id` en el prompt (por ejemplo `@tdd`).

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

Los archivos se copiaron sin modificar, salvo `grill-me` y `handoff`, a los que se les quitó
`disable-model-invocation: true` para que OpenCode pueda anunciarlas al modelo.

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
