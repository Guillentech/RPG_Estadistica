import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, Shield, Sparkles, Map, Trophy, ScrollText } from 'lucide-react';

export default function Home() {
  return (
    <div className="container" style={{ maxWidth: '1050px', marginTop: '1.5rem' }}>
      {/* Hero Banner Arcade / RPG */}
      <div className="rpg-box" style={{ 
        textAlign: 'center', 
        padding: '3rem 2rem', 
        background: 'radial-gradient(circle at top, #1e293b 0%, #090d16 100%)',
        marginBottom: '2.5rem'
      }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'rgba(251, 191, 36, 0.15)', 
          color: '#fbbf24', 
          padding: '0.4rem 1rem', 
          borderRadius: '999px',
          border: '1px solid rgba(251, 191, 36, 0.4)',
          fontSize: '0.8rem',
          fontWeight: '700',
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={15} /> MUNDO ACADÉMICO INTERACTIVO 2D
        </div>

        <h1 className="font-pixel" style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.3rem)', color: '#fbbf24', marginBottom: '1.25rem', textShadow: '0 4px 0 #000' }}>
          SAGA ACADÉMICA
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
          Donde el semestre es un mapa explorable en 2D, los apuntes son pergaminos ancestrales y los exámenes son combates épicos contra Jefes Finales.
        </p>

        {/* Características de la Saga */}
        <div className="grid-3" style={{ textAlign: 'left', marginTop: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ color: '#38bdf8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>

<Map size={18} />
Biomas Explorables
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Camina con tu personaje por cada unidad temática del semestre.</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ color: '#f87171', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <Swords size={18} /> Jefes Finales (Bosses)
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Derrota evaluaciones cronometradas restando puntos de vida (HP) con tus aciertos.</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ color: '#fbbf24', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <Trophy size={18} /> Nivel y Puntos XP
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Tus calificaciones en pruebas y misiones suben el nivel y rango de tu héroe.</p>
          </div>
        </div>
      </div>

      {/* Selección de Portal */}
      <div className="grid-2">
        {/* Portal del Estudiante (RPG) */}
        <div className="card-pro" style={{ border: '2px solid rgba(251, 191, 36, 0.45)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Swords size={26} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '800', textTransform: 'uppercase' }}>Modo Aventura 2D</span>
              <h3 style={{ fontSize: '1.35rem' }}>Portal de Aventureros</h3>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Ingresa con tu <strong>Código Único de Gremio (EST-XXXX)</strong> asignado por tu profesor para entrar al mapa interactivo, abrir cofres de código, entregar misiones y enfrentar a los Jefes Finales.
          </p>

          <Link 
            to="/estudiante" 
            className="btn-pro" 
            style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#090d16', fontWeight: '800', padding: '0.9rem' }}
          >
            ⚔️ Ingresar con Código de Gremio
          </Link>
        </div>

        {/* Portal del Profesor (Consola Game Master) */}
        <div className="card-pro" style={{ border: '1px solid rgba(59, 130, 246, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={26} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: '800', textTransform: 'uppercase' }}>Administración & Oráculo IA</span>
              <h3 style={{ fontSize: '1.35rem' }}>Consola del Game Master</h3>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Panel de alta productividad docente para reclutar estudiantes, diseñar Biomas (temas), redactar Pergaminos (ejemplos), invocar Jefes Finales (exámenes) con ayuda de IA y auditar el ranking de notas.
          </p>

          <Link to="/profesor" className="btn-pro btn-pro-primary" style={{ width: '100%', padding: '0.9rem' }}>
            🧙‍♂️ Iniciar Sesión Game Master
          </Link>
        </div>
      </div>
    </div>
  );
}