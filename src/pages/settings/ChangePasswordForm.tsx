import { useState } from 'react';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import apiClient from '../../api/client';
import { KronosButton, KronosInput } from '../../components/kronos';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage, type ApiErrorResponse } from '../../types/api';

const ChangePasswordForm = () => {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const localError =
    next && next.length < 8 ? 'Debe tener al menos 8 caracteres'
    : confirm && next !== confirm ? 'Las contraseñas no coinciden'
    : next && next === current ? 'Debe ser distinta de la actual'
    : null;
  const canSubmit = !!current && !!next && !!confirm && !localError && !busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    try {
      const { data } = await apiClient.post('/auth/change-password', { currentPassword: current, newPassword: next });
      if (data?.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      toast.success('Contraseña actualizada. Se cerraron las demás sesiones.');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 429) {
        toast.error('Demasiados intentos, espera un minuto');
      } else if (!axiosError.response) {
        toast.error('No se pudo conectar con el servidor');
      } else {
        toast.error(getErrorMessage(axiosError.response?.data));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm space-y-3">
      <input type="text" name="username" autoComplete="username" value={user?.email ?? ''} readOnly hidden />
      <KronosInput type="password" label="Contraseña actual" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
      <KronosInput type="password" label="Nueva contraseña" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
      <KronosInput type="password" label="Confirmar nueva contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      {localError && <p className="text-xs text-red-500">{localError}</p>}
      <KronosButton type="submit" size="sm" disabled={!canSubmit}>
        {busy ? 'Guardando…' : 'Cambiar contraseña'}
      </KronosButton>
    </form>
  );
};

export default ChangePasswordForm;
