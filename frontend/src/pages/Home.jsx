import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  NeonScene,
  PixelIcon,
  PortalRunes,
  RpgWindow,
  StatBar,
} from '../components/rpg';

const HUD_PREVIEW = {
  hp: 100,
  mp: 60,
  xp: 150,
  nivel: 1,
};

export default function Home() {
  useEffect(() => {
    document.body.classList.add('home-active');
    return () => document.body.classList.remove('home-active');
  }, []);

  return (
    <div className="home-neon">
      <NeonScene />

      <div className="container home-neon__content">
        {/* HUD decorativo de campaña: los valores reales viven en el panel del estudiante */}
        <aside className="home-hud" aria-hidden="true">
          <div className="home-hud__avatar">
            <PixelIcon name="crystal" size={32} />
          </div>
          <div className="home-hud__body">
            <div className="home-hud__top">
              <span className="home-hud__name">HÉROE DEL GREMIO</span>
              <span className="home-hud__level">NVL {HUD_PREVIEW.nivel}</span>
            </div>
            <div className="home-hud__bars">
              <StatBar label="HP" value={HUD_PREVIEW.hp} max={100} color="hp" showPercent={false} />
              <StatBar label="MP" value={HUD_PREVIEW.mp} max={100} color="mp" showPercent={false} />
              <StatBar label="XP" value={HUD_PREVIEW.xp} max={250} color="xp" showPercent={false} />
            </div>
          </div>
        </aside>

        <header className="home-hero">
          <div className="hero-badge">
            <PixelIcon name="spark" size={14} className="hero-badge__icon" />
            <span>CAMPAÑA SEMESTRAL ACTIVA • MODO COOPERATIVO RPG 2D</span>
          </div>

          <h1 className="pixel-font hero-title">SAGA ACADÉMICA</h1>

          <p className="hero-lead">
            Explora el mapa del semestre a través de biomas interactivos, desbloquea{' '}
            <strong className="text-teacher">Pergaminos de Teoría</strong>, consulta al{' '}
            <strong className="text-gold">Sabio Alquimista AI</strong> y derrota a los{' '}
            <strong className="text-magenta">Jefes Finales</strong> para subir de nivel y ganar XP.
          </p>
        </header>

        {/* Tarjetas principales de acceso */}
        <div className="grid-2 portal-grid" style={{ maxWidth: '860px', margin: '0 auto 2.5rem auto' }}>
          <div className="portal-shell portal-shell--student">
            <PortalRunes className="portal-shell__runes" />
            <div className="portal-shell__sparks" aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => (
                <span key={index} className="portal-spark" style={{ '--i': index }} />
              ))}
            </div>

            <RpgWindow
              title="PORTAL DEL GREMIO"
              icon={<PixelIcon name="swords" size={16} />}
              className="role-card role-card--student"
            >
              <div className="role-card__head">
                <div className="role-card__id">
                  <div className="role-icon role-icon--student">
                    <PixelIcon name="swords" size={32} />
                  </div>
                  <div>
                    <span className="role-eyebrow">JUGADOR / AVENTURERO</span>
                    <h3 className="role-title">Portal del Gremio</h3>
                  </div>
                </div>
                <span className="badge badge-success">TOKEN EST-XXXX</span>
              </div>

              <p className="role-copy">
                Ingresa con tu código único de gremio para recorrer el Mapa 2D del semestre, estudiar
                pergaminos, entregar misiones y enfrentar a los Jefes de evaluación.
              </p>

              <Link to="/estudiante" className="pixel-btn pixel-btn--gold role-cta">
                <PixelIcon name="sword" size={16} /> Ingresar con Código de Gremio
              </Link>
            </RpgWindow>
          </div>

          <div className="portal-shell portal-shell--teacher">
            <RpgWindow
              title="CONSOLA GAME MASTER"
              icon={<PixelIcon name="shield" size={16} />}
              className="role-card role-card--teacher"
            >
              <div className="role-card__head">
                <div className="role-card__id">
                  <div className="role-icon role-icon--teacher">
                    <PixelIcon name="shield" size={32} />
                  </div>
                  <div>
                    <span className="role-eyebrow role-eyebrow--teacher">DOCENTE / ADMINISTRADOR</span>
                    <h3 className="role-title">Consola Game Master</h3>
                  </div>
                </div>
                <span className="badge badge--teacher">COPILOTO IA</span>
              </div>

              <p className="role-copy">
                Diseña biomas por tema, publica pergaminos de código, invoca Jefes Finales asistido
                por el Copiloto IA y audita la experiencia (XP) y notas de tu clase.
              </p>

              <Link to="/profesor" className="pixel-btn role-cta">
                <PixelIcon name="shield" size={16} /> Abrir Consola Game Master
              </Link>
            </RpgWindow>
          </div>
        </div>

        {/* Características del mundo RPG */}
        <div className="grid-3 feature-grid" style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'left' }}>
          <RpgWindow
            title="MAPA DE BIOMAS 2D"
            icon={<PixelIcon name="map" size={14} />}
            className="feature-card feature-card--map"
          >
            <div className="feature-sprite feature-sprite--map">
              <PixelIcon name="map" size={72} />
            </div>
            <strong className="feature-title">Mapa de Biomas 2D</strong>
            <p className="feature-copy">
              Cada unidad académica es una zona explorable (Bosque, Ruinas, Laboratorio o Mazmorra)
              con alertas climáticas de entrega.
            </p>
          </RpgWindow>

          <RpgWindow
            title="PERGAMINOS Y ALQUIMISTA"
            icon={<PixelIcon name="scroll" size={14} />}
            className="feature-card feature-card--scroll"
          >
            <div className="feature-sprite feature-sprite--scroll">
              <PixelIcon name="scroll" size={56} />
              <PixelIcon name="potion" size={56} />
            </div>
            <strong className="feature-title">Pergaminos y Alquimista AI</strong>
            <p className="feature-copy">
              Estudia ejemplos prácticos interactivos y consulta al búho Sabio Alquimista AI antes
              de entrar al combate.
            </p>
          </RpgWindow>

          <RpgWindow
            title="COMBATE Y XP"
            icon={<PixelIcon name="swords" size={14} />}
            className="feature-card feature-card--xp"
          >
            <div className="feature-sprite feature-sprite--xp">
              <PixelIcon name="swords" size={72} />
            </div>
            <strong className="feature-title">Combate contra Jefes y XP</strong>
            <p className="feature-copy">
              Cada acierto en el examen reduce la barra de HP del Jefe Final y convierte tu
              calificación en XP y Nivel de personaje.
            </p>
          </RpgWindow>
        </div>
      </div>
    </div>
  );
}
