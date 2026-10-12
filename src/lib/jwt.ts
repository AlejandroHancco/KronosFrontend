/** Decodifica el payload de un JWT sin verificar la firma (solo lectura client-side). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const payload = token.split('.')[1];
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/** `exp` del JWT en milisegundos desde epoch, o null si no se puede leer. */
export function getJwtExpiry(token: string): number | null {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') return null;
    return payload.exp * 1000;
}
