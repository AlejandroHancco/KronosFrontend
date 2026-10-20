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

/** Paleta de canales de la app (MeasurementChart.tsx), legible sobre fondo blanco. */
export const CHANNEL_COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];
export const channelColor = (ch: number) => CHANNEL_COLORS[(ch - 1) % CHANNEL_COLORS.length];

export const WATCHER_PDF: Record<string, { label: string; color: string }> = {
  correct: { label: 'Correcta', color: '#15803d' },
  warning: { label: 'Advertencia', color: '#b45309' },
  error: { label: 'Error', color: '#b91c1c' },
};
