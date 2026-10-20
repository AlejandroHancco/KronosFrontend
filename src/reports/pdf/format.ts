export const formatFreq = (hz: number): string => {
  if (hz >= 1e6) return `${+(hz / 1e6).toFixed(3)} MHz`;
  if (hz >= 1e3) return `${+(hz / 1e3).toFixed(3)} kHz`;
  return `${+hz.toFixed(2)} Hz`;
};

export const formatDate = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export const formatSci = (v: number): string => (v === 0 ? '0' : v.toExponential(1));

export const slug = (text: string): string =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'tarea';

export const publicUrl = (): string =>
  (import.meta.env.VITE_PUBLIC_URL as string | undefined)?.replace(/\/$/, '') || window.location.origin;

/**
 * Pasos "light-surface" de la misma paleta categórica de 8 tonos (azul, naranja, aqua,
 * amarillo, magenta, verde, violeta, rojo), validados con el validador de dataviz sobre
 * #ffffff (todos los checks pasan; aqua/amarillo/magenta quedan por debajo de 3:1 de
 * contraste, por lo que el PDF depende de la leyenda de canal para la identidad).
 */
export const CHANNEL_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
export const channelColor = (ch: number) => CHANNEL_COLORS[(ch - 1) % CHANNEL_COLORS.length];

export const WATCHER_PDF: Record<string, { label: string; color: string }> = {
  correct: { label: 'Correcta', color: '#15803d' },
  warning: { label: 'Advertencia', color: '#b45309' },
  error: { label: 'Error', color: '#b91c1c' },
};
