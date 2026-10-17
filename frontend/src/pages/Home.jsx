import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, ShieldCheck, Scroll, Sparkles, Trophy, Map } from 'lucide-react';

export default function Home() {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '2.2rem' }}>
      {/* Insignia Arcade Superior */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.45rem 1rem',
        borderRadius: '999px',
        background: 'rgba(168, 85, 247, 0.16)',
        border: '1px solid #c084fc',
        color: '#e9d5ff',
        fontSize: '0.78rem',
        fontWeight: '700',
        marginBottom: '1.25rem'
      }}>
        <Sparkles size={15} color="#fbbf24" />
        <span>CAMPAÑA SEMESTRAL ACTIVA • MODO COOPERATIVO RPG 2D</span>
      </div>

      <h1 className="pixel-font" style={{ 
        fontSize: 'clamp(1.45rem, 3.5vw, 2.35rem)', 
        marginBottom: '1rem',
        color: '#ffffff',
        textShadow: '0 4px 0 #581c87, 0 0 25px rgba(168, 85, 247, 0.5)'
      }}>
        SAGA ACADÉMICA
      </h1>

      <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto 2.2rem auto', fontSize: '1rem', lineHeight: '1.6' }}>
        Explora el mapa del semestre a través de biomas interactivos, desbloquea <strong style={{ color: '#c4b5fd' }}>Pergaminos de Teoría</strong>, consulta al <strong style={{ color: '#fbbf24' }}>Sabio Alquimista AI</strong> y derrota a los <strong style={{ color: '#f87171' }}>Jefes Finales</strong> para subir de nivel y ganar XP.
      </p>

      {/* Tarjetas Principales de Acceso (Estudiante y Game Master) */}
      <div className="grid-2" style={{ maxWidth: '840px', margin: '0 auto 2.5rem auto' }}>
        <div className="card-pro" style={{ 
          textAlign: 'left', 
          border: '2px solid #9333ea',
          background: 'linear-gradient(145deg, #17153b 0%, #111827 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.65rem', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #c084fc' }}>
                <Swords size={26} color="#e9d5ff" />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: '800', textTransform: 'uppercase' }}>Jugador / Aventurero</span>
                <h3 style={{ fontSize: '1.25rem' }}>Portal del Gremio</h3>
              </div>
            </div>
            <span className="badge badge-success">TOKEN EST-XXXX</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.55' }}>
            Ingresa con tu código único de gremio para recorrer el Mapa 2D del semestre, estudiar pergaminos, entregar misiones y enfrentar a los Jefes de evaluación.
          </p>

          <Link to="/estudiante" className="btn-pro btn-pro-ai" style={{ width: '100%', padding: '0.9rem' }}>
            <Swords size={18} /> Ingresar con Código de Gremio
          </Link>
        </div>

        <div className="card-pro" style={{ 
          textAlign: 'left', 
          border: '2px solid rgba(56, 189, 248, 0.45)',
          background: 'linear-gradient(145deg, #0f172a 0%, #131c31 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.65rem', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8' }}>
                <ShieldCheck size={26} color="#38bdf8" />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase' }}>Docente / Administrador</span>
                <h3 style={{ fontSize: '1.25rem' }}>Consola Game Master</h3>
              </div>
            </div>
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>COPILOTO IA</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.55' }}>
            Diseña biomas por tema, publica pergaminos de código, invoca Jefes Finales asistido por el Copiloto IA y audita la experiencia (XP) y notas de tu clase.
          </p>

          <Link to="/profesor" className="btn-pro btn-pro-primary" style={{ width: '100%', padding: '0.9rem' }}>
            <ShieldCheck size={18} /> Abrir Consola Game Master
          </Link>
        </div>
      </div>

      {/* Características del Mundo RPG */}
      <div className="grid-3" style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'left' }}>
        <div className="card-pro" style={{ marginBottom: 0, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', color: '#34d399' }}>
            <Map size={20} />
            <strong>Mapa de Biomas 2D</strong>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Cada unidad académica es una zona explorable (Bosque, Ruinas, Laboratorio o Mazmorra) con alertas climáticas de entrega.
          </p>
        </div>

        <div className="card-pro" style={{ marginBottom: 0, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', color: '#c084fc' }}>
            <Scroll size={20} />
            <strong>Pergaminos y Alquimista AI</strong>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Estudia ejemplos prácticos interactivos y consulta al búho Sabio Alquimista AI antes de entrar al combate.
          </p>
        </div>

        <div className="card-pro" style={{ marginBottom: 0, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', color: '#fbbf24' }}>
            <Trophy size={20} />
            <strong>Combate contra Jefes y XP</strong>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Cada acierto en el examen reduce la barra de HP del Jefe Final y convierte tu calificación en XP y Nivel de personaje.
          </p>
        </div>
      </div>
    </div>
  );
}