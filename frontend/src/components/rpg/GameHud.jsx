import React from 'react';
import { CloudLightning, Swords, ScrollText } from 'lucide-react';
import { AvatarHero16Bit, AlchemistWizard16Bit } from '../mapa/Sprites';
import PixelBar from './PixelBar';
import RuneAudioPlayer from './RuneAudioPlayer';

/**
 * HUD superior unificado del estudiante.
 * Avatar a la izquierda; a su lado, nombre y las tres barras (XP / Energía / HP)
 * apiladas para imitar el HUD de un RPG clásico. A la derecha, el tablón de
 * estrategia del reino (clima + jefes) y la runa musical.
 */
export default function GameHud({
  user,
  nivelActual = 1,
  xpEnNivel = 0,
  xpMaximo = 250,
  energiaActual = 100,
  hpActual = 100,
  examenesPendientes = 0,
  tareasPendientes = 0,
  hayTormenta = false,
  onHablarAlquimista,
}) {
  const clase = user?.clase_rpg || 'Aventurero';
  const token = user?.codigo_unico;

  return (
    <section
      aria-label="HUD del aventurero"
      className="relative mb-3 border-4 border-solid border-[#8a5cf6] bg-[#271d5c] p-2 shadow-[inset_0_4px_0_0_#3b2d86,inset_0_-4px_0_0_#170f3d,0_4px_0_0_#0a0718] sm:p-2.5"
    >
      <div className="grid grid-cols-1 items-center gap-2.5 md:grid-cols-[minmax(0,1.35fr)_minmax(300px,1fr)_auto]">
        {/* ── Avatar + identidad + barras ─────────────────────────────── */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative shrink-0">
            <div className="grid h-[58px] w-[58px] place-items-center overflow-hidden border-2 border-solid border-[#ffd23f] bg-[#170f3d] shadow-[inset_0_0_0_2px_#8a5cf6,0_3px_0_0_#0a0718] sm:h-[66px] sm:w-[66px]">
              <AvatarHero16Bit clase={clase} />
            </div>
            <span className="ui-px absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#ffd23f] px-1.5 py-[1px] text-[7px] leading-none text-[#120c2b] shadow-[0_2px_0_0_#0a0718]">
              NV {nivelActual}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex min-w-0 items-baseline gap-2">
              <span className="ui-px truncate text-[10px] leading-none text-[#f6efe0] sm:text-[11px]">
                {user?.nombre || 'Estudiante'}
              </span>
              <span className="hidden min-w-0 truncate text-[15px] leading-none text-[#c4a7ff] sm:block">
                {clase}
              </span>
            </div>

            <div className="flex max-w-[430px] flex-col gap-[3px]">
              <PixelBar tone="xp" value={xpEnNivel} max={xpMaximo} label="Experiencia" />
              <PixelBar tone="stamina" value={energiaActual} max={100} label="Energía" />
              <PixelBar tone="hp" value={hpActual} max={100} label="Vida" />
            </div>

            {token && (
              <p className="mt-1 hidden truncate text-[13px] leading-none text-[#8a5cf6] lg:block">
                TOKEN {token}
              </p>
            )}
          </div>
        </div>

        {/* ── Tablón de anuncios / mesa de estrategia ──────────────────── */}
        <div className="relative border-2 border-solid border-[#3b2d86] bg-[#120c2b] p-1.5 shadow-[inset_0_0_0_2px_#0a0718,4px_4px_0_0_#170f3d]">
          <div className="mb-1 flex items-center justify-between gap-2 border-b-2 border-solid border-[#3b2d86] pb-1">
            <span className="ui-px text-[7px] leading-none text-[#ffd23f]">TABLÓN DEL REINO</span>
            <span className="ui-px hidden text-[6px] leading-none text-[#8a5cf6] sm:block">
              MESA DE ESTRATEGIA
            </span>
          </div>

          <div className="grid gap-1.5">
            <div className="flex min-w-0 items-center gap-1.5 bg-[#1b1440] px-1.5 py-1 shadow-[inset_0_0_0_1px_#3b2d86]">
              <CloudLightning
                size={16}
                className={hayTormenta ? 'shrink-0 text-[#ff7a6b]' : 'shrink-0 text-[#ffd23f]'}
              />
              <div className="min-w-0">
                <span className="ui-px block text-[6px] leading-none text-[#b4aedb]">CLIMA 24H</span>
                <span
                  className={`block truncate text-[15px] leading-none ${
                    hayTormenta ? 'text-[#ff7a6b]' : 'text-[#f6efe0]'
                  }`}
                >
                  {hayTormenta ? 'Tormenta de fechas' : 'Cielo despejado'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex min-w-0 items-center gap-1.5 bg-[#1b1440] px-1.5 py-1 shadow-[inset_0_0_0_1px_#3b2d86]">
                <Swords size={15} className="shrink-0 text-[#ffd23f]" />
                <div className="min-w-0">
                  <span className="ui-px block text-[6px] leading-none text-[#b4aedb]">JEFES ACTIVOS</span>
                  <span className="block truncate text-[14px] leading-none text-[#f6efe0]">
                    {examenesPendientes} {examenesPendientes === 1 ? 'guardián' : 'guardianes'}
                  </span>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-1.5 bg-[#1b1440] px-1.5 py-1 shadow-[inset_0_0_0_1px_#3b2d86]">
                <ScrollText size={14} className="shrink-0 text-[#8a5cf6]" />
                <div className="min-w-0">
                  <span className="ui-px block text-[6px] leading-none text-[#b4aedb]">MISIONES</span>
                  <span className="block truncate text-[14px] leading-none text-[#f6efe0]">
                    {tareasPendientes} pendientes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Asistente del Gremio + runa musical ──────────────────────── */}
        <div className="flex items-center justify-between gap-2 md:justify-end">
          <span className="ui-px text-[6px] leading-none text-[#8a5cf6] md:hidden">
            ASISTENTE DEL GREMIO
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onHablarAlquimista}
              aria-label="Hablar con el Sabio Alquimista, asistente del gremio"
              title={examenesPendientes > 0
                ? 'El Sabio Alquimista tiene pistas sobre los jefes activos'
                : 'Consultar al Sabio Alquimista AI'}
              className="group relative grid h-11 w-11 place-items-center border-2 border-solid border-[#ffd23f] bg-[#120c2b] shadow-[inset_0_2px_0_0_#4b2fa3,inset_0_-3px_0_0_#0a0718,0_3px_0_0_#0a0718] hover:-translate-y-[1px] hover:border-[#ffe08a] active:translate-y-[2px]"
            >
              <span className="block [&_svg]:h-9 [&_svg]:w-auto">
                <AlchemistWizard16Bit />
              </span>
              <span className="ui-px absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#ffd23f] px-1 text-[6px] leading-[1.4] text-[#120c2b] shadow-[0_2px_0_0_#0a0718]">
                IA
              </span>
              {examenesPendientes > 0 && (
                <span
                  aria-hidden="true"
                  className="ui-px absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center bg-[#ffd23f] text-[7px] leading-none text-[#120c2b] shadow-[0_0_0_2px_#0a0718]"
                >
                  !
                </span>
              )}
            </button>

            <RuneAudioPlayer />
          </div>
        </div>
      </div>
    </section>
  );
}
