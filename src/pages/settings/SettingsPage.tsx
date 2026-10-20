import { useState } from 'react';
import { toast } from 'sonner';
import {
  KronosLayout, KronosPageHeader, KronosCard, KronosTabs, KronosTabContent,
} from '../../components/kronos';
import { useAuth } from '../../hooks/useAuth';
import { useGetCurrentTeam } from '../../hooks/useTeams';
import { FREQ_UNITS, getPreferences, savePreferences, type FreqUnit } from '../../lib/preferences';
import ChangePasswordForm from './ChangePasswordForm';
import SessionPanel from './SessionPanel';

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex gap-4 py-1.5 text-sm">
    <span className="w-28 shrink-0 text-muted-foreground">{k}</span>
    <span className="text-foreground">{v}</span>
  </div>
);

const SettingsPage = () => {
  const { user } = useAuth();
  const { data: team } = useGetCurrentTeam();
  const [unit, setUnit] = useState<FreqUnit>(() => getPreferences().defaultFreqUnit);

  const changeUnit = (u: FreqUnit) => {
    setUnit(savePreferences({ defaultFreqUnit: u }).defaultFreqUnit);
    toast.success(`Unidad por defecto: ${u}`);
  };

  return (
    <KronosLayout title="Configuración" subtitle="Tu cuenta y preferencias">
      <KronosPageHeader title="Configuración" description="Perfil, preferencias de la interfaz y sesión." />

      <KronosTabs
        tabs={[
          { value: 'perfil', label: 'Perfil' },
          { value: 'preferencias', label: 'Preferencias' },
          { value: 'sesion', label: 'Sesión' },
        ]}
      >
        <KronosTabContent value="perfil">
          <KronosCard className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Datos de la cuenta</h3>
              <Row k="Nombre" v={[user?.name, user?.lastName].filter(Boolean).join(' ') || '—'} />
              <Row k="Email" v={user?.email ?? '—'} />
              <Row k="Rol" v={user?.roleNames?.join(', ') || '—'} />
              <Row k="Equipo" v={team?.name ?? '—'} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Contraseña</h3>
              {user?.provider === 'jwt' ? (
                <ChangePasswordForm />
              ) : (
                <p className="text-sm text-muted-foreground">Tu contraseña se gestiona en Google.</p>
              )}
            </div>
          </KronosCard>
        </KronosTabContent>

        <KronosTabContent value="preferencias">
          <KronosCard className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Unidad de frecuencia por defecto</h3>
            <p className="text-xs text-muted-foreground">
              Se usa al abrir la configuración de barrido. Solo cambia cómo se muestran los valores; la base de datos siempre guarda Hz.
            </p>
            <div className="flex gap-2">
              {FREQ_UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => changeUnit(u)}
                  className={
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors ' +
                    (unit === u ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50')
                  }
                >
                  {u}
                </button>
              ))}
            </div>
          </KronosCard>
        </KronosTabContent>

        <KronosTabContent value="sesion">
          <KronosCard>
            <SessionPanel />
          </KronosCard>
        </KronosTabContent>
      </KronosTabs>
    </KronosLayout>
  );
};

export default SettingsPage;
