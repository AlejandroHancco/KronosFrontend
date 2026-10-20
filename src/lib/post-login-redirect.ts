const KEY = 'kronos:postLoginRedirect';

export function rememberPostLoginRedirect(path: string): void {
  try { sessionStorage.setItem(KEY, path); } catch { /* storage bloqueado: se ignora */ }
}

/** Devuelve (y borra) la ruta guardada; solo rutas internas. */
export function consumePostLoginRedirect(fallback = '/dashboard'): string {
  try {
    const path = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return path && path.startsWith('/') && !path.startsWith('//') && !path.includes('\\') ? path : fallback;
  } catch {
    return fallback;
  }
}
