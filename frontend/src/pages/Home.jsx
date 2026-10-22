import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, ShieldCheck, Scroll, Sparkles, Trophy, Map } from 'lucide-react';
import { RpgWindow } from '../components/rpg';

export default function Home() {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '2.2rem' }}>
      {/* Insignia Arcade Superior */}
      <div className="hero-badge">
        <Sparkles size={15} className="text-gold" />
        <span>CAMPAÑA SEMESTRAL ACTIVA • MODO COOPERATIVO RPG 2D</span>
      </div>

      <h1 className="pixel-font hero-title">
        SAGA ACADÉMICA
      </h1>

      <p className="hero-lead">
        Explora el mapa del semestre a través de biomas interactivos, desbloquea{' '}
        <strong className="text-student">Pergaminos de Teoría</strong>, consulta al{' '}
        <strong className="text-gold">Sabio Alquimista AI</strong> y derrota a los{' '}
        <strong className="text-danger">Jefes Finales</strong> para subir de nivel y ganar XP.
      </p>

      {/* Tarjetas Principales de Acceso (Estudiante y Game Master) */}
      <div className="grid-2" style={{ maxWidth: '840px', margin: '0 auto 2.5rem auto' }}>
        <RpgWindow title="PORTAL DEL GREMIO" icon="⚔️" className="role-card role-card--student">
          <div className="role-card__head">
            <div className="role-card__id">
              <div className="role-icon role-icon--student">
                <Swords size={26} />
              </div>
              <div>
                <span className="role-eyebrow">JUGADOR / AVENTURERO</span>
                <h3 className="role-title">Portal del Gremio</h3>
              </div>
            </div>
            <span className="badge badge-success">TOKEN EST-XXXX</span>
          </div>

          <p className="role-copy">
            Ingresa con tu código único de gremio para recorrer el Mapa 2D del semestre, estudiar pergaminos, entregar misiones y enfrentar a los Jefes de evaluación.
          </p>

          <Link to="/estudiante" className="pixel-btn pixel-btn--gold role-cta">
            <Swords size={16} /> Ingresar con Código de Gremio
          </Link>
        </RpgWindow>

        <RpgWindow title="CONSOLA GAME MASTER" icon="🧙‍♂️" className="role-card role-card--teacher">
          <div className="role-card__head">
            <div className="role-card__id">
              <div className="role-icon role-icon--teacher">
                <ShieldCheck size={26} />
              </div>
              <div>
                <span className="role-eyebrow role-eyebrow--teacher">DOCENTE / ADMINISTRADOR</span>
                <h3 className="role-title">Consola Game Master</h3>
              </div>
            </div>
            <span className="badge badge--teacher">COPILOTO IA</span>
          </div>

          <p className="role-copy">
            Diseña biomas por tema, publica pergaminos de código, invoca Jefes Finales asistido por el Copiloto IA y audita la experiencia (XP) y notas de tu clase.
          </p>

          <Link to="/profesor" className="pixel-btn role-cta">
            <ShieldCheck size={16} /> Abrir Consola Game Master
          </Link>
        </RpgWindow>
      </div>

      {/* Características del Mundo RPG */}
      <div className="grid-3" style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'left' }}>
        <RpgWindow title="MAPA DE BIOMAS 2D" icon="🗺️">
          <div className="feature-head feature-head--map">
            <Map size={20} />
            <strong className="feature-title">Mapa de Biomas 2D</strong>
          </div>
          <p className="feature-copy">
            Cada unidad académica es una zona explorable (Bosque, Ruinas, Laboratorio o Mazmorra) con alertas climáticas de entrega.
          </p>
        </RpgWindow>

        <RpgWindow title="PERGAMINOS Y ALQUIMISTA" icon="📜">
          <div className="feature-head feature-head--scroll">
            <Scroll size={20} />
            <strong className="feature-title">Pergaminos y Alquimista AI</strong>
          </div>
          <p className="feature-copy">
            Estudia ejemplos prácticos interactivos y consulta al búho Sabio Alquimista AI antes de entrar al combate.
          </p>
        </RpgWindow>

        <RpgWindow title="COMBATE Y XP" icon="🏆">
          <div className="feature-head feature-head--xp">
            <Trophy size={20} />
            <strong className="feature-title">Combate contra Jefes y XP</strong>
          </div>
          <p className="feature-copy">
            Cada acierto en el examen reduce la barra de HP del Jefe Final y convierte tu calificación en XP y Nivel de personaje.
          </p>
        </RpgWindow>
      </div>
    </div>
  );
}
