import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Backpack, Scroll, Users, Trophy, CloudLightning, Send, GraduationCap, UserRound, FileText
} from 'lucide-react';
import { StatBar } from '../components/rpg';
import MapaGeneral from '../components/mapa/MapaGeneral';
import MapaUnidad from '../components/mapa/MapaUnidad';
import ModalTema from '../components/mapa/ModalTema';
import ModalEntrega from '../components/mapa/ModalEntrega';
import PerfilEstudiante from '../components/perfil/PerfilEstudiante';
import { urlArchivo } from '../config';
import { AlchemistWizard16Bit, AvatarHero16Bit } from '../components/mapa/Sprites';
import { TERRENOS, terrenoDeUnidad, ANCHO_LOGICO } from '../game/terreno';
import { esTileTransitable, puntoInicio } from '../game/mapa';
import { calcularProgresoUnidad, crearUnidadCampamento, temasDeUnidad } from '../game/progreso';
import useMediaQuery from '../hooks/useMediaQuery';

// 📚 Constante de la escala académica (la materia vale 100 puntos)
const NOTA_MAX = 100;

export default function PanelEstudiante() {
  const { user, refrescarEstudiante } = useAuth();
  const navigate = useNavigate();
  const wrapperMapaRef = useRef(null);  // Contenedor para medir la escala entera
  const esMovil = useMediaQuery('(max-width: 640px)');

  // 💡 Estados para la navegación de la barra inferior (Hotbar)
  const [vistaHotbar, setVistaHotbar] = useState('mapa');

  // 💡 Escala entera del canvas (1x, 2x, 3x...) para evitar píxeles borrosos
  const [escalaMapa, setEscalaMapa] = useState(2);

  // 💡 Estados para almacenar los datos traídos del Backend (SQLite)
  const [temas, setTemas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [misEntregas, setMisEntregas] = useState([]);
  const [gremio, setGremio] = useState([]);
  const [boleta, setBoleta] = useState(null); // 📚 Boleta académica (nota 0-100 puntos)

  // 💡 Estados del Motor de Mapa 2D por Tiles y Ciudadelas
  const [heroPos, setHeroPos] = useState({ x: 15, y: 8 });
  const [caminando, setCaminando] = useState(false);
  const [zonaActivaModal, setZonaActivaModal] = useState(null);
  const [unidadActiva, setUnidadActiva] = useState(null);

  // 💡 Estados de Entregas de Misiones (Trabajos Prácticos)
  const [tareaEnEntrega, setTareaEnEntrega] = useState(null);

  // 💡 Estados del Sabio Alquimista (Copiloto IA Estudiantil)
  const [dialogoAlquimistaAbierto, setDialogoAlquimistaAbierto] = useState(false);
  const [preguntaAlquimista, setPreguntaAlquimista] = useState('');
  const [respuestaAlquimista, setRespuestaAlquimista] = useState('');
  const [cargandoAlquimista, setCargandoAlquimista] = useState(false);

  // 💡 FUNCIÓN: Cargar toda la data de la base de datos al inicio
  const cargarDatos = () => {
    fetch('http://localhost:4000/api/unidades')
      .then(r => { if (!r.ok) throw new Error('No se pudieron cargar las Ciudadelas'); return r.json(); })
      .then(setUnidades)
      .catch(() => setUnidades([]));
    fetch('http://localhost:4000/api/temas').then(r => r.json()).then(setTemas);
    fetch('http://localhost:4000/api/evaluaciones').then(r => r.json()).then(setEvaluaciones);
    fetch('http://localhost:4000/api/tareas').then(r => r.json()).then(setTareas);
    fetch('http://localhost:4000/api/gremio').then(r => r.json()).then(setGremio);

    if (user?.id) {
      refrescarEstudiante();
      fetch(`http://localhost:4000/api/calificaciones/estudiante/${user.id}`)
        .then(r => r.json())
        .then(setCalificaciones);

      fetch(`http://localhost:4000/api/estudiantes/${user.id}/boleta`)
        .then(r => r.json())
        .then(setBoleta)
        .catch(() => setBoleta(null));

      fetch(`http://localhost:4000/api/entregas/estudiante/${user.id}`)
        .then(r => r.json())
        .then(setMisEntregas);
    }
  };

  useEffect(() => {
    cargarDatos();
    // cargarDatos se recrea en cada render; solo dependemos del usuario autenticado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ==========================================================================
  // 💡 CÁLCULO DE ESCALA ENTERA (1x, 2x, 3x...) PARA EVITAR PÍXELES BORROSOS
  // ==========================================================================
  useEffect(() => {
    const actualizarEscala = () => {
      if (!wrapperMapaRef.current) return;
      const anchoDisponible = wrapperMapaRef.current.clientWidth - 8;
      const factorEntero = Math.max(1, Math.floor(anchoDisponible / ANCHO_LOGICO));
      setEscalaMapa(factorEntero);
    };

    actualizarEscala();
    window.addEventListener('resize', actualizarEscala);
    return () => window.removeEventListener('resize', actualizarEscala);
  }, [vistaHotbar]);

  // ==========================================================================
  // 💡 DATOS DERIVADOS DEL MAPA CONTINENTAL Y DE LA UNIDAD ACTIVA
  // ==========================================================================
  const temasSinUnidad = temas.filter(tema => tema.unidad_id == null);
  const campamento = crearUnidadCampamento(temasSinUnidad);
  const unidadesVisibles = campamento ? [...unidades, campamento] : unidades;
  const temasUnidadActiva = unidadActiva
    ? (unidadActiva.esCampamento ? temasSinUnidad : temasDeUnidad(temas, unidadActiva.id))
    : [];
  const terrenoActual = unidadActiva ? terrenoDeUnidad(unidadActiva) : TERRENOS.continental;

  const progresoPorUnidad = Object.fromEntries(unidadesVisibles.map(unidad => {
    const temasDeLaUnidad = unidad.esCampamento ? temasSinUnidad : temasDeUnidad(temas, unidad.id);
    return [unidad.id, calcularProgresoUnidad({
      temas: temasDeLaUnidad,
      evaluaciones,
      tareas,
      calificaciones,
      entregas: misEntregas
    })];
  }));

  // ==========================================================================
  // 💡 MOVIMIENTO DEL HÉROE Y NAVEGACIÓN ENTRE CIUDADELAS
  // ==========================================================================
  const moverHeroe = (col, fila) => {
    if (!esTileTransitable(terrenoActual, col, fila)) return;
    setCaminando(true);
    setHeroPos({ x: col, y: fila });
    setTimeout(() => setCaminando(false), 180);
  };

  useEffect(() => {
    if (vistaHotbar !== 'mapa' || zonaActivaModal || dialogoAlquimistaAbierto) return undefined;

    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      let dx = 0;
      let dy = 0;

      if (k === 'w' || k === 'arrowup') dy = -1;
      else if (k === 's' || k === 'arrowdown') dy = 1;
      else if (k === 'a' || k === 'arrowleft') dx = -1;
      else if (k === 'd' || k === 'arrowright') dx = 1;
      else return;

      e.preventDefault();
      setHeroPos(prev => {
        const nuevaCol = Math.max(0, Math.min(29, prev.x + dx));
        const nuevaFila = Math.max(0, Math.min(16, prev.y + dy));
        if (!esTileTransitable(terrenoActual, nuevaCol, nuevaFila)) return prev;
        return { x: nuevaCol, y: nuevaFila };
      });
      setCaminando(true);
      setTimeout(() => setCaminando(false), 150);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vistaHotbar, zonaActivaModal, dialogoAlquimistaAbierto, terrenoActual]);

  const posicionInicial = (terreno) => {
    const punto = puntoInicio(terreno);
    return { x: punto.col, y: punto.fila };
  };

  const entrarUnidad = (unidad, posicion) => {
    setCaminando(true);
    if (posicion) setHeroPos({ x: posicion.x, y: posicion.y });
    setTimeout(() => {
      setCaminando(false);
      setUnidadActiva(unidad);
      setHeroPos(posicionInicial(terrenoDeUnidad(unidad)));
      setZonaActivaModal(null);
    }, 240);
  };

  const salirUnidad = () => {
    setUnidadActiva(null);
    setZonaActivaModal(null);
    setHeroPos(posicionInicial(TERRENOS.continental));
  };

  const abrirTema = (tema, posicion) => {
    if (posicion) {
      setCaminando(true);
      setHeroPos({ x: posicion.x, y: posicion.y });
      setTimeout(() => setCaminando(false), 180);
    }
    setZonaActivaModal({
      titulo: tema.titulo,
      descripcion: tema.descripcion,
      ejemplos: tema.ejemplos || [],
      evaluaciones: evaluaciones.filter(ev => ev.tema_id === tema.id)
    });
  };

  const abrirJefeUnidad = (evals) => {
    const nombreUnidad = unidadActiva?.esCampamento ? 'zona' : 'Unidad ' + (unidadActiva?.numero ?? '');
    setZonaActivaModal({
      titulo: 'Jefe de la ' + nombreUnidad,
      descripcion: 'El guardián de la Ciudadela aguarda al final del sendero. Derrota a este jefe para cerrar la Unidad.',
      ejemplos: [],
      evaluaciones: evals
    });
  };

  // 💡 FUNCIÓN: Consultar al Bot AI del Sabio Alquimista
  const consultarSabioAlquimista = async (e) => {
    e.preventDefault();
    if (!preguntaAlquimista.trim()) return;
    setCargandoAlquimista(true);
    try {
      const titulosTemas = temas.map(t => t.titulo).join(', ');
      const res = await fetch('http://localhost:4000/api/ia/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: preguntaAlquimista.trim(),
          modo: 'alquimista',
          contexto: `Biomas del mapa: ${titulosTemas}`
        })
      });
      const data = await res.json();
      if (res.ok) setRespuestaAlquimista(data.resultado);
    } catch {
      setRespuestaAlquimista('🦉 El Sabio Alquimista medita sobre tu consulta... intenta nuevamente.');
    } finally {
      setCargandoAlquimista(false);
    }
  };

  // ==========================================================================
  // 💡 CÁLCULOS DEL HUD (ESTADÍSTICAS DEL JUGADOR Y CLIMA)
  // ==========================================================================
  const xpActual = user?.xp || 150;
  const nivelActual = user?.nivel || 1;
  const xpEnNivel = xpActual % 250;

  const examenesPendientes = evaluaciones.filter(ev => !calificaciones.some(c => c.evaluacion_id === ev.id));
  const tareasPendientes = tareas.filter(t => !misEntregas.some(e => e.tarea_id === t.id));
  
  const energiaActual = Math.max(35, 100 - (examenesPendientes.length * 10));
  const hayTormenta = examenesPendientes.length > 0 || tareasPendientes.length > 0;

  return (
    <div className="container page-shell" style={{ maxWidth: '1220px' }}>
      
      {/* =====================================================================
          1. TOP HUD 16-BIT (AVATAR IZQ | BARRAS XP Y ENERGÍA CENTRO | CLIMA DER)
         ===================================================================== */}
      <div className="hud-panel">
        <div className="hud-hero">
          <div className="hud-avatar">
            <AvatarHero16Bit clase={user?.clase_rpg || 'Arquera Lógica'} />
          </div>
          <div className="hud-identity">
            <span className="hud-name">
              {user?.nombre || 'Estudiante'}
            </span>
            <span className="hud-role">
              Nvl {nivelActual} • {user?.clase_rpg || 'Aventurero'}
            </span>
            <span className="hud-token">
              TOKEN: {user?.codigo_unico || 'N/A'}
            </span>
          </div>
        </div>

        <div className="hud-stats">
          <StatBar label="★ EXPERIENCIA (XP)" value={xpEnNivel} max={250} color="xp" suffix=" XP" showPercent />
          <StatBar label="⚡ ENERGÍA / STAMINA" value={energiaActual} max={100} color="stamina" suffix=" EN" showPercent />
          <StatBar label="❤ HP DEL JUGADOR" value={Math.min(100, 60 + nivelActual * 5)} max={100} color="hp" suffix=" HP" showPercent />
        </div>

        <div className="hud-weather">
          <div className="hud-weather__icon">
            <CloudLightning size={22} />
          </div>
          <div>
            <span className="hud-weather__label">CLIMA: 24H</span>
            <span className={`hud-weather__state ${hayTormenta ? 'is-storm' : ''}`}>
              {hayTormenta ? 'TORMENTA DE FECHAS' : 'CIELO DESPEJADO'}
            </span>
            <span className="hud-weather__meta">
              {examenesPendientes.length} Jefes activos
            </span>
          </div>
        </div>
      </div>

            {vistaHotbar === 'mapa' && (
        <div ref={wrapperMapaRef} className="mapa-wrapper w-full flex justify-center overflow-x-auto">
          {!unidadActiva ? (
            <MapaGeneral
              unidades={unidadesVisibles}
              terreno={TERRENOS.continental}
              heroPos={heroPos}
              escala={escalaMapa}
              caminando={caminando}
              progresoPorUnidad={progresoPorUnidad}
              claseHeroe={user?.clase_rpg || 'Arquera Lógica'}
              esMovil={esMovil}
              onMoverHeroe={moverHeroe}
              onEntrarUnidad={entrarUnidad}
            />
          ) : (
            <MapaUnidad
              unidad={unidadActiva}
              temas={temasUnidadActiva}
              terreno={terrenoActual}
              heroPos={heroPos}
              escala={escalaMapa}
              caminando={caminando}
              claseHeroe={user?.clase_rpg || 'Arquera Lógica'}
              evaluaciones={evaluaciones}
              tareas={tareas}
              calificaciones={calificaciones}
              entregas={misEntregas}
              esMovil={esMovil}
              onVolver={salirUnidad}
              onMoverHeroe={moverHeroe}
              onTemaClick={abrirTema}
              onJefeClick={abrirJefeUnidad}
            />
          )}

          {!unidadActiva && !esMovil && (
            <button
              type="button"
              onClick={() => setDialogoAlquimistaAbierto(true)}
              className="alchemist-bubble alchemist-bubble--compact"
              title={examenesPendientes.length > 0
                ? `El Jefe de "${examenesPendientes[0].titulo}" aguarda en una Ciudadela.`
                : 'Consultar al Sabio Alquimista AI'}
              aria-label="Abrir el Sabio Alquimista AI"
            >
              <span className="alchemist-bubble__sprite"><AlchemistWizard16Bit /></span>
              <span className="alchemist-bubble__alert" aria-hidden="true">!</span>
            </button>
          )}

          {zonaActivaModal && (
            <ModalTema
              zona={zonaActivaModal}
              calificaciones={calificaciones}
              onClose={() => setZonaActivaModal(null)}
              onIniciarEvaluacion={(ev) => navigate(`/evaluacion/${ev.id}`)}
            />
          )}

          {/* 💡 MODAL DEL MENTOR AI (Chat con el Sabio Alquimista) */}
          {dialogoAlquimistaAbierto && (
            <div className="rpg-modal" role="dialog" aria-modal="true" aria-label="Sabio Alquimista AI">
              <div className="rpg-modal__head">
                <div className="role-card__id">
                  <span className="alchemist-bubble__sprite"><AlchemistWizard16Bit /></span>
                  <div>
                    <span className="hud-eyebrow hud-eyebrow--gold">MENTOR ARCANO IA</span>
                    <h3 className="rpg-modal__title">Sabio Alquimista AI</h3>
                  </div>
                </div>
                <button onClick={() => setDialogoAlquimistaAbierto(false)} className="btn-danger btn-sm">✕ Cerrar</button>
              </div>

              <div className="rpg-modal__body rpg-modal__body--column">
                <div className="ai-dialogue">
                  {respuestaAlquimista || `🧙‍♂️ "¡Saludos, ${user?.nombre || 'Aventurero'}! Escribe cualquier duda sobre Cálculo, Programación o Estadística y te guiaré antes de que cruces la puerta de la mazmorra."`}
                </div>

                <form onSubmit={consultarSabioAlquimista} className="ai-ask">
                  <input type="text" className="input-pro" placeholder="Pregúntale al Sabio Alquimista..." value={preguntaAlquimista} onChange={(e) => setPreguntaAlquimista(e.target.value)} />
                  <button type="submit" disabled={cargandoAlquimista} className="btn-pro btn-pro-ai">
                    <Send size={16} /> {cargandoAlquimista ? 'Consultando...' : 'Consultar'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

{/* =====================================================================
          3. SUB-VISTAS DE LA BARRA INFERIOR (INVENTARIO, PERGAMINOS, GREMIO, LOGROS)
         ===================================================================== */}
      {vistaHotbar === 'inventario' && (
        <div className="card-pro">
          <h3 className="pixel-font section-title section-title--gold">🎒 INVENTARIO Y MISIONES ({tareas.length})</h3>
          {tareas.length === 0 && (
            <p className="rpg-empty">Aún no hay misiones publicadas. El Game Master las dejará caer en tu inventario.</p>
          )}
          {tareas.map(tar => {
            const entrega = misEntregas.find(e => e.tarea_id === tar.id);
            return (
              <div key={tar.id} className="quest-card">
                <div className="quest-card__head">
                  <h4 className="quest-card__title">⚔️ {tar.titulo} <span className="text-muted">({tar.tema_titulo})</span></h4>
                  <span className={`badge ${entrega ? 'badge-success' : 'badge-danger'}`}>
                    {entrega ? 'Entregada' : 'Pendiente'}
                  </span>
                </div>
                <p className="quest-card__desc">{tar.descripcion}</p>

                <span className="quest-card__meta text-xp">
                  📚 Vale {tar.puntos_max ?? 10} de 100 pts de la materia
                  {entrega?.calificacion != null && (
                    <> • Tu nota: {entrega.calificacion}% = <strong>{entrega.puntos_ganados ?? '—'} pts</strong></>
                  )}
                  {entrega && entrega.calificacion == null && <> • Esperando calificación del Game Master</>}
                </span>

                {tar.archivo_adjunto && (
                  <a
                    href={tar.archivo_adjunto}
                    download={`Guia_Mision_${tar.titulo.replace(/\s+/g, '_')}`}
                    className="quest-file"
                  >
                    📄 Descargar Documento Adjunto
                  </a>
                )}

                {entrega?.contenido && (
                  <pre className="rpg-code rpg-code--tight">{entrega.contenido}</pre>
                )}

                {entrega?.archivo_ruta && (
                  <a
                    href={urlArchivo(entrega.archivo_ruta)}
                    download={entrega.archivo_nombre || `Entrega_${tar.titulo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quest-file"
                  >
                    <FileText size={14} /> {entrega.archivo_nombre || 'Documento adjunto'}
                  </a>
                )}

                <button
                  onClick={() => setTareaEnEntrega(tar)}
                  className="btn-pro btn-pro-primary btn-block"
                  style={{ marginTop: '0.5rem' }}
                >
                  <Send size={15} /> {entrega ? 'Actualizar entrega' : 'Entregar misión'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {vistaHotbar === 'perfil' && <PerfilEstudiante />}

      {vistaHotbar === 'pergaminos' && (
        <div className="card-pro">
          <h3 className="pixel-font section-title section-title--xp">📜 PERGAMINOS DE TEORÍA</h3>
          {temas.length === 0 && (
            <p className="rpg-empty">La biblioteca aún está vacía. Consulta al Sabio Alquimista AI mientras tanto.</p>
          )}
          {temas.map(t => (
            <div key={t.id} className="scroll-entry">
              <h4 className="scroll-entry__title">{t.titulo}</h4>
              <p className="scroll-entry__desc">{t.descripcion}</p>
              {t.ejemplos?.map(ej => (
                <pre key={ej.id} className="rpg-code">
                  <strong>// {ej.titulo}</strong>{'\n'}{ej.contenido}
                </pre>
              ))}
            </div>
          ))}
        </div>
      )}

      {vistaHotbar === 'gremio' && (
        <div className="card-pro">
          <h3 className="pixel-font section-title section-title--teacher">🛡️ TABLA DEL GREMIO</h3>
          <div className="rpg-table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Aventurero</th><th>Clase</th><th>Nivel</th><th>XP</th></tr>
              </thead>
              <tbody>
                {gremio.map((m, i) => (
                  <tr key={m.id}>
                    <td>{i + 1}</td>
                    <td className="text-strong">{m.nombre}</td>
                    <td className="text-student">{m.clase_rpg}</td>
                    <td>Nvl {m.nivel || 1}</td>
                    <td className="text-xp">{m.xp || 150} XP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {gremio.length === 0 && <p className="rpg-empty">El gremio aún no tiene aventureros registrados.</p>}
        </div>
      )}

      {vistaHotbar === 'boleta' && (
        <div className="card-pro">
          <h3 className="pixel-font section-title section-title--gold">🎓 BOLETA DE LA MATERIA</h3>

          {!boleta ? (
            <p className="rpg-empty">Cargando boleta académica...</p>
          ) : (
            <>
              <div className="achievement-row" style={{ alignItems: 'flex-start' }}>
                <div>
                  <strong className="achievement-row__title">NOTA ACTUAL</strong>
                  <span className="achievement-row__meta">
                    Escala de la materia: 0 a {boleta.nota_max} puntos • {boleta.puntos_ganados} ganados • {boleta.puntos_restantes_materia} por ganar
                  </span>
                </div>
                <span className={`achievement-score ${boleta.nota_materia >= 60 ? 'is-pass' : 'is-fail'}`}>
                  {boleta.nota_materia} / {boleta.nota_max}
                </span>
              </div>

              <StatBar
                label={`★ NOTA DE LA MATERIA (${boleta.puntos_ganados} / ${boleta.nota_max} PTS)`}
                value={boleta.nota_materia}
                max={boleta.nota_max}
                color="xp"
                suffix=" pts"
                showPercent={false}
              />

              <p className="section-sub">
                📖 Cada actividad vale unos puntos de la materia. Tu nota es la suma de los puntos que has ganado
                (nunca supera {boleta.nota_max}). La XP y el nivel son progresión de tu héroe y <strong>no afectan la nota</strong>.
              </p>

              <h4 className="zone-column__title">📜 ACTIVIDADES CALIFICADAS ({boleta.rendimiento.length})</h4>
              {boleta.rendimiento.length === 0 && (
                <p className="rpg-empty">Aún no has ganado puntos. ¡Rinde un examen o entrega una misión!</p>
              )}
              {boleta.rendimiento.length > 0 && (
                <div className="rpg-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Actividad</th>
                        <th>Tipo</th>
                        <th>Tema</th>
                        <th>Puntos</th>
                        <th>Desempeño</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boleta.rendimiento.map((r) => (
                        <tr key={`${r.tipo}-${r.registro_id}`}>
                          <td className="text-strong">{r.actividad}</td>
                          <td>{r.tipo === 'examen' ? '⚔️ Examen' : '🎒 Misión'}</td>
                          <td className="text-student">{r.tema_titulo}</td>
                          <td className="text-xp is-strong">{r.puntos_ganados} / {r.puntos_max} pts</td>
                          <td className={r.porcentaje >= 60 ? 'badge badge-success' : 'badge badge-danger'}>
                            {r.porcentaje}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h4 className="zone-column__title" style={{ marginTop: '1rem' }}>⏳ PUNTOS PENDIENTES ({boleta.pendientes.length})</h4>
              {boleta.pendientes.length === 0 ? (
                <p className="rpg-empty">¡Completaste todas las actividades de la materia!</p>
              ) : (
                boleta.pendientes.map((p) => (
                  <div key={`${p.tipo}-${p.actividad_id}`} className="achievement-row">
                    <div>
                      <strong className="achievement-row__title">{p.actividad}</strong>
                      <span className="achievement-row__meta">
                        {p.tipo === 'examen' ? '⚔️ Examen' : '🎒 Misión'} • Tema: {p.tema_titulo}
                      </span>
                    </div>
                    <span className="achievement-score is-fail">{p.puntos_max} pts en juego</span>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}

      {vistaHotbar === 'logros' && (
        <div className="card-pro">
          <h3 className="pixel-font section-title section-title--gold">🏆 LOGROS Y RESULTADOS</h3>
          <p className="section-sub">
            📚 Escala de la materia: 0 a {NOTA_MAX} puntos. Tu nota actual es <strong>{boleta?.nota_materia ?? 0} / {NOTA_MAX} pts</strong>.
            La XP y el nivel no afectan la nota.
          </p>
          {calificaciones.length === 0 && (
            <p className="rpg-empty">Todavía no has librado ningún combate. ¡Entra a un bioma y desafía a su Jefe!</p>
          )}
          {calificaciones.map(cal => (
            <div key={cal.id} className="achievement-row">
              <div>
                <strong className="achievement-row__title">{cal.evaluacion_titulo}</strong>
                <span className="achievement-row__meta">
                  Tema: {cal.tema_titulo || '—'} • +{cal.xp_ganada || 150} XP • {cal.aciertos}/{cal.total_preguntas} aciertos • 📚 {cal.puntos_ganados ?? '—'}/{cal.puntos_max ?? '—'} pts
                </span>
              </div>
              <span className={`achievement-score ${cal.puntaje >= 60 ? 'is-pass' : 'is-fail'}`}>{cal.puntaje}%</span>
            </div>
          ))}
        </div>
      )}

      {tareaEnEntrega && (
        <ModalEntrega
          tarea={tareaEnEntrega}
          entrega={misEntregas.find(e => e.tarea_id === tareaEnEntrega.id)}
          estudianteId={user?.id}
          onClose={() => setTareaEnEntrega(null)}
          onEnviada={(mensaje) => {
            setTareaEnEntrega(null);
            alert(mensaje);
            cargarDatos();
          }}
        />
      )}

      {/* =====================================================================
          4. BOTTOM HUD (BARRA DE NAVEGACIÓN INFERIOR)
         ===================================================================== */}
      <div className="rpg-hotbar" style={{ marginTop: '0.85rem' }}>
        <button className={`rpg-hotbar-slot rpg-hotbar-slot--map ${vistaHotbar === 'mapa' ? 'active' : ''}`} onClick={() => setVistaHotbar('mapa')}>
          <span className="pixel-font">Mapa</span>
        </button>
        <button className={`rpg-hotbar-slot rpg-hotbar-slot--bag ${vistaHotbar === 'inventario' ? 'active' : ''}`} onClick={() => setVistaHotbar('inventario')}>
          <Backpack size={20} />
          <span className="pixel-font">Inventario</span>
        </button>
        <button className={`rpg-hotbar-slot rpg-hotbar-slot--scroll ${vistaHotbar === 'pergaminos' ? 'active' : ''}`} onClick={() => setVistaHotbar('pergaminos')}>
          <Scroll size={20} />
          <span className="pixel-font">Pergaminos</span>
        </button>
        <button className={`rpg-hotbar-slot rpg-hotbar-slot--guild ${vistaHotbar === 'gremio' ? 'active' : ''}`} onClick={() => setVistaHotbar('gremio')}>
          <Users size={20} />
          <span className="pixel-font">Gremio</span>
        </button>
        <button className={`rpg-hotbar-slot rpg-hotbar-slot--boleta ${vistaHotbar === 'boleta' ? 'active' : ''}`} onClick={() => setVistaHotbar('boleta')}>
          <GraduationCap size={20} />
          <span className="pixel-font">Boleta</span>
        </button>
        <button className={`rpg-hotbar-slot rpg-hotbar-slot--trophy ${vistaHotbar === 'logros' ? 'active' : ''}`} onClick={() => setVistaHotbar('logros')}>
          <Trophy size={20} />
          <span className="pixel-font">Logros</span>
        </button>
        <button className={`rpg-hotbar-slot ${vistaHotbar === 'perfil' ? 'active' : ''}`} onClick={() => setVistaHotbar('perfil')}>
          <UserRound size={20} />
          <span className="pixel-font">Perfil</span>
        </button>
      </div>
    </div>
  );
}
