import React from 'react';
import PixelIcon from './PixelIcon';

/**
 * Hotbar de inventario clásica (Minecraft / Diablo).
 * Seis ranuras cuadradas simétricas, con relieve pixelado y foco dorado
 * cuando la sección está activa. Los iconos son pixel-art (PixelIcon),
 * no emojis del navegador.
 */
const SECCIONES_HOTBAR = [
  { key: 'mapa', label: 'MAPA', icon: 'map', tone: '#3ddc84', tecla: '1' },
  { key: 'inventario', label: 'MOCHILA', icon: 'bag', tone: '#ff8a3d', tecla: '2' },
  { key: 'pergaminos', label: 'PERGAM.', icon: 'scroll', tone: '#ffd23f', tecla: '3' },
  { key: 'gremio', label: 'GREMIO', icon: 'guild', tone: '#4cc9f0', tecla: '4' },
  { key: 'boleta', label: 'BOLETA', icon: 'cap', tone: '#ffd23f', tecla: '5' },
  { key: 'logros', label: 'LOGROS', icon: 'trophy', tone: '#ffd23f', tecla: '6' },
];

export default function GameHotbar({ activa = 'mapa', onChange }) {
  return (
    <nav
      aria-label="Barra de navegación del aventurero"
      className="mx-auto mt-3 w-full max-w-[540px] border-4 border-solid border-[#3b2d86] bg-[#170f3d] p-1.5 shadow-[inset_0_3px_0_0_#271d5c,inset_0_-3px_0_0_#0a0718,0_4px_0_0_#0a0718]"
    >
      <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
        {SECCIONES_HOTBAR.map((slot) => {
          const isActive = activa === slot.key;
          return (
            <button
              key={slot.key}
              type="button"
              onClick={() => onChange?.(slot.key)}
              aria-pressed={isActive}
              aria-label={slot.label}
              title={`${slot.label} (${slot.tecla})`}
              className={`group relative flex aspect-square min-w-0 flex-col items-center justify-center gap-0.5 border-2 border-solid p-0.5 ${
                isActive
                  ? '-translate-y-[2px] border-[#ffd23f] bg-[#4b2fa3] shadow-[inset_0_0_0_1px_#ffe08a,0_0_0_2px_#ffd23f,0_0_0_4px_#0a0718]'
                  : 'border-[#3b2d86] bg-[#271d5c] shadow-[inset_0_2px_0_0_#4b2fa3,inset_0_-3px_0_0_#120c2b] hover:-translate-y-[1px] hover:border-[#ffd23f] hover:bg-[#3b2d86]'
              }`}
            >
              <span
                aria-hidden="true"
                className={`ui-px absolute left-1 top-0.5 text-[5px] leading-none ${
                  isActive ? 'text-[#ffe08a]' : 'text-[#8a5cf6] group-hover:text-[#ffd23f]'
                }`}
              >
                {slot.tecla}
              </span>

              <span
                className="grid place-items-center"
                style={{ color: isActive ? '#ffd23f' : slot.tone }}
              >
                <PixelIcon name={slot.icon} size={22} />
              </span>

              <span
                className={`ui-px w-full truncate text-center text-[5px] leading-none sm:text-[6px] ${
                  isActive ? 'text-[#ffe08a]' : 'text-[#b4aedb] group-hover:text-[#f6efe0]'
                }`}
              >
                {slot.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
