import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { KronosButton } from '../../components/kronos';
import { useAuth } from '../../hooks/useAuth';
import { getJwtExpiry } from '../../lib/jwt';

const readExpiry = (): number | null => {
  const token = localStorage.getItem('token');
  return token ? getJwtExpiry(token) : null;
};

const formatLeft = (ms: number): string => {
  if (ms <= 0) return 'expirada';
  const min = Math.floor(ms / 60000);
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`;
};

const SessionPanel = () => {
  const { user, refreshToken, logout } = useAuth();
  const isJwt = user?.provider === 'jwt';
  const [expiresAt, setExpiresAt] = useState<number | null>(readExpiry);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const extend = async () => {
    setBusy(true);
    const ok = await refreshToken();
    setBusy(false);
    setExpiresAt(readExpiry());
    toast[ok ? 'success' : 'error'](ok ? 'Sesión extendida' : 'No se pudo extender la sesión');
  };

  return (
    <div className="space-y-4">
      {isJwt ? (
        <div className="flex items-center gap-4">
          <p className="text-sm text-foreground">
            Tiempo restante: <span className="font-mono">{expiresAt ? formatLeft(expiresAt - now) : '—'}</span>
          </p>
          <KronosButton size="sm" variant="outline" onClick={extend} disabled={busy}>
            {busy ? 'Extendiendo…' : 'Extender sesión'}
          </KronosButton>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Tu sesión de Google se renueva automáticamente.</p>
      )}
      <KronosButton size="sm" variant="outline" onClick={() => logout()}>Cerrar sesión</KronosButton>
    </div>
  );
};

export default SessionPanel;
