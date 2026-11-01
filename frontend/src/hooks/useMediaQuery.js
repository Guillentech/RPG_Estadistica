import { useSyncExternalStore } from 'react';

export default function useMediaQuery(consulta) {
  return useSyncExternalStore(
    (notificar) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const media = window.matchMedia(consulta);
      media.addEventListener?.('change', notificar);
      return () => media.removeEventListener?.('change', notificar);
    },
    () => {
      if (typeof window === 'undefined' || !window.matchMedia) return false;
      return window.matchMedia(consulta).matches;
    },
    () => false
  );
}
