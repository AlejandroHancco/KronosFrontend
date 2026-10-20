export type FreqUnit = 'Hz' | 'kHz' | 'MHz';
export const FREQ_UNITS: FreqUnit[] = ['Hz', 'kHz', 'MHz'];

export interface Preferences {
  defaultFreqUnit: FreqUnit;
}

const KEY = 'kronos:prefs';
const DEFAULTS: Preferences = { defaultFreqUnit: 'kHz' };

/** Preferencias por navegador. Si el storage está bloqueado o corrupto, devuelve los defaults. */
export function getPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      defaultFreqUnit: FREQ_UNITS.includes(parsed.defaultFreqUnit as FreqUnit)
        ? (parsed.defaultFreqUnit as FreqUnit)
        : DEFAULTS.defaultFreqUnit,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePreferences(patch: Partial<Preferences>): Preferences {
  const next = { ...getPreferences(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage bloqueado: se ignora */ }
  return next;
}
