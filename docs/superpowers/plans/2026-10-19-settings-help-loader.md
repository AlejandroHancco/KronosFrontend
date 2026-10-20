# Settings, Help y loader "cardiograma" — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Páginas `/settings` y `/help` funcionales y un loader animado con forma de traza de medición en toda la app.

**Architecture:** Backend agrega `POST /auth/change-password`. Frontend agrega `KronosLoader` (SVG + CSS), un módulo de preferencias en `localStorage`, `SettingsPage` (Perfil / Preferencias / Sesión) y `HelpPage` (acordeón con buscador, contenido estático).

**Tech Stack:** NestJS 11 + Prisma 7 + bcrypt + Jest; React 19 + Vite + Tailwind v4 + shadcn `accordion` + Kronos components + sonner.

Spec: `docs/superpowers/specs/2026-10-19-settings-help-loader-design.md`

## Global Constraints

- Repos: `C:\Users\Alejandro\WebstormProjects\SmartConcreteBackend` y `C:\Users\Alejandro\WebstormProjects\SmartConcreteFrontend`, ambos en la rama `feat/settings-help` (ya creada).
- **Commits SIN `Co-Authored-By` ni ninguna atribución a Claude.**
- Textos de UI en español.
- Colores solo vía tokens CSS (`var(--primary)`, `var(--border)`, clases `text-muted-foreground`, etc.); los tokens del proyecto son valores `oklch(...)` crudos — usar `var(--x)`, nunca `hsl(var(--x))`.
- Verificación backend: `npx jest <ruta>` + `npx tsc --noEmit -p tsconfig.json`; frontend: `npx tsc --noEmit -p tsconfig.app.json && npx vite build`.

---

### Task 1: Backend — `POST /auth/change-password`

**Files:**
- Create: `SmartConcreteBackend/src/auth/dto/change-password.dto.ts`
- Modify: `SmartConcreteBackend/src/auth/auth.service.ts` (nuevo método)
- Modify: `SmartConcreteBackend/src/auth/auth.controller.ts` (nueva ruta)
- Test: `SmartConcreteBackend/src/auth/auth.service.spec.ts`

**Interfaces:**
- Produces: `POST /auth/change-password` body `{ currentPassword: string; newPassword: string }` → `{ ok: true }`; 400 con mensajes en español en los casos de error.

- [ ] **Step 1: Test que falla.** `src/auth/auth.service.spec.ts`:

```ts
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService.changePassword', () => {
  const prisma = { user: { findUnique: jest.fn(), update: jest.fn() } };
  const service = new AuthService(prisma as any, {} as any, {} as any);

  beforeEach(() => jest.clearAllMocks());

  it('rechaza cuentas sin contraseña local (Google)', async () => {
    prisma.user.findUnique.mockResolvedValue({ uuid: 'u', password: null });
    await expect(service.changePassword('u', 'x', 'nuevaClave1')).rejects.toThrow(
      'Tu cuenta usa Google; no tiene contraseña local',
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rechaza la contraseña actual incorrecta', async () => {
    prisma.user.findUnique.mockResolvedValue({ uuid: 'u', password: await bcrypt.hash('correcta1', 4) });
    await expect(service.changePassword('u', 'incorrecta', 'nuevaClave1')).rejects.toThrow(
      'La contraseña actual es incorrecta',
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rechaza una nueva contraseña igual a la actual', async () => {
    prisma.user.findUnique.mockResolvedValue({ uuid: 'u', password: await bcrypt.hash('correcta1', 4) });
    await expect(service.changePassword('u', 'correcta1', 'correcta1')).rejects.toThrow(
      'La nueva contraseña debe ser distinta de la actual',
    );
  });

  it('guarda el hash de la nueva contraseña', async () => {
    prisma.user.findUnique.mockResolvedValue({ uuid: 'u', password: await bcrypt.hash('correcta1', 4) });
    prisma.user.update.mockResolvedValue({});
    await expect(service.changePassword('u', 'correcta1', 'nuevaClave1')).resolves.toEqual({ ok: true });
    const call = prisma.user.update.mock.calls[0][0];
    expect(call.where).toEqual({ uuid: 'u' });
    expect(await bcrypt.compare('nuevaClave1', call.data.password)).toBe(true);
  });
});
```

- [ ] **Step 2: Correr y ver que falla.** Run: `npx jest src/auth/auth.service.spec.ts` → FAIL (`service.changePassword is not a function`).

- [ ] **Step 3: Implementación.** En `auth.service.ts`: agregar `BadRequestException` al import de `@nestjs/common` y el método:

```ts
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { uuid: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.password) {
      throw new BadRequestException('Tu cuenta usa Google; no tiene contraseña local');
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }
    if (currentPassword === newPassword) {
      throw new BadRequestException('La nueva contraseña debe ser distinta de la actual');
    }
    await this.prisma.user.update({
      where: { uuid: userId },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });
    return { ok: true };
  }
```

`src/auth/dto/change-password.dto.ts`:

```ts
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  newPassword: string;
}
```

En `auth.controller.ts` (importar `ChangePasswordDto`), después de `refresh`:

```ts
  // Límite estricto: evita adivinar la contraseña actual por fuerza bruta
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }
```

- [ ] **Step 4: Verificar.** `npx jest src/auth/auth.service.spec.ts` → PASS (4); `npx jest` → todo PASS; `npx tsc --noEmit -p tsconfig.json` → limpio. Si el backend corre en :3000 (watch), curl con token de `ahancco@pucp.edu.pe` / `admin123`: `{"currentPassword":"mala","newPassword":"otraClave1"}` → 400 "La contraseña actual es incorrecta"; `{"currentPassword":"admin123","newPassword":"corta"}` → 400 de validación. **No** ejecutar un cambio real de contraseña.

- [ ] **Step 5: Commit.**

```bash
git add src/auth/dto/change-password.dto.ts src/auth/auth.service.ts src/auth/auth.controller.ts src/auth/auth.service.spec.ts
git commit -m "feat(auth): add change-password endpoint"
```

---

### Task 2: `KronosLoader` (traza de medición) y reemplazo de loaders

**Files:**
- Create: `SmartConcreteFrontend/src/components/kronos/kronos-loader.tsx`
- Modify: `SmartConcreteFrontend/src/components/kronos/index.ts` (export)
- Modify: `SmartConcreteFrontend/src/styles/globals.css` (keyframes, fuera de `@layer base`)
- Modify: `SmartConcreteFrontend/src/components/LoadingSpinner.tsx`
- Modify (reemplazar textos "Cargando…" de carga de listas): `src/pages/ActivityLogPage.tsx`, `src/pages/NotificationsPage.tsx`, `src/pages/ReportsPage.tsx`, `src/pages/modals/TaskMeasurementsModal.tsx`, `src/pages/DashboardPage.tsx` (~419), `src/pages/ProjectDetailPage.tsx` (~506), `src/pages/admin/PermissionsPage.tsx` (~118)

**Interfaces:**
- Produces: `KronosLoader({ size?: 'page' | 'section'; label?: string; className?: string })` exportado desde `src/components/kronos`.

- [ ] **Step 1: Componente.** `src/components/kronos/kronos-loader.tsx`:

```tsx
import { cn } from "../../lib/utils"

// Curva de barrido de impedancia estilizada: línea base, pico de resonancia de G,
// valle y cola. pathLength=1 permite animar el trazo en unidades relativas.
const TRACE =
  "M0,44 L38,44 C52,44 58,42 64,34 C70,22 75,8 80,8 C85,8 89,24 95,36 C99,44 104,48 110,46 C118,44 124,38 132,40 C140,42 152,44 200,44"

interface KronosLoaderProps {
  size?: "page" | "section"
  label?: string
  className?: string
}

export function KronosLoader({ size = "section", label, className }: KronosLoaderProps) {
  const text = label ?? (size === "page" ? "Midiendo…" : "Cargando…")
  return (
    <div
      role="status"
      aria-label={text}
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        size === "page" ? "h-64" : "py-8",
        className,
      )}
    >
      <svg
        viewBox="0 0 200 56"
        className={size === "page" ? "w-64" : "w-40"}
        aria-hidden="true"
      >
        <defs>
          <pattern id="kronos-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0H0V10" fill="none" stroke="var(--border)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="200" height="56" fill="url(#kronos-grid)" opacity="0.6" />
        {/* traza completa, tenue */}
        <path d={TRACE} pathLength={1} fill="none" stroke="var(--primary)" strokeOpacity="0.15" strokeWidth="1.5" />
        {/* segmento brillante que recorre la traza */}
        <path
          className="kronos-trace"
          d={TRACE}
          pathLength={1}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle className="kronos-trace-dot" r="2.5" fill="var(--primary)">
          <animateMotion dur="1.6s" repeatCount="indefinite" path={TRACE} />
        </circle>
      </svg>
      <span className="text-xs text-muted-foreground">{text}</span>
    </div>
  )
}
```

- [ ] **Step 2: CSS.** En `src/styles/globals.css`, al final del archivo (fuera de `@layer base`):

```css
/* KronosLoader: segmento que recorre la traza (dash 0.3 sobre pathLength 1) */
@keyframes kronos-trace {
  from { stroke-dashoffset: 0.3; }
  to   { stroke-dashoffset: -0.7; }
}
@keyframes kronos-pulse {
  50% { opacity: 0.35; }
}
.kronos-trace {
  stroke-dasharray: 0.3 2;
  animation: kronos-trace 1.6s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .kronos-trace {
    stroke-dasharray: none;
    animation: kronos-pulse 2s ease-in-out infinite;
  }
  .kronos-trace-dot { display: none; }
}
```

- [ ] **Step 3: Export.** En `src/components/kronos/index.ts` agregar: `export { KronosLoader } from "./kronos-loader"`.

- [ ] **Step 4: `LoadingSpinner`** — reemplazar su contenido completo por:

```tsx
import { KronosLoader } from './kronos';

const LoadingSpinner = () => <KronosLoader size="page" />;

export default LoadingSpinner;
```

- [ ] **Step 5: Reemplazos de "Cargando…".** En cada archivo de la lista, sustituir el elemento que muestra el texto de carga de la lista/página (`<p ...>Cargando...</p>`, `Cargando…`, `Cargando permisos...`) por `<KronosLoader />` (o `<KronosLoader label="Cargando permisos…" />` en PermissionsPage), importando `KronosLoader` desde el barrel `components/kronos` con la ruta relativa que use el archivo. Mantener el contenedor que lo envuelve si tiene layout propio (p. ej. el `div` centrado de PermissionsPage). No tocar textos "Cargando" que estén dentro de botones.

- [ ] **Step 6: Verificar.** `npx tsc --noEmit -p tsconfig.app.json && npx vite build` → limpio. `grep -rn "Cargando\.\.\.\|Cargando…" src/pages` → solo deben quedar ocurrencias dentro de botones (si las hay; listarlas en el reporte).

- [ ] **Step 7: Commit.**

```bash
git add src/components/kronos/kronos-loader.tsx src/components/kronos/index.ts src/styles/globals.css src/components/LoadingSpinner.tsx src/pages
git commit -m "feat(ui): measurement-trace loader replaces spinners and loading text"
```

---

### Task 3: Preferencias de usuario (unidad de frecuencia)

**Files:**
- Create: `SmartConcreteFrontend/src/lib/preferences.ts`
- Modify: `SmartConcreteFrontend/src/components/task/SweepConfigCard.tsx` (~líneas 60-61 y ~181)

**Interfaces:**
- Produces: `type FreqUnit = 'Hz' | 'kHz' | 'MHz'`, `FREQ_UNITS: FreqUnit[]`, `interface Preferences { defaultFreqUnit: FreqUnit }`, `getPreferences(): Preferences`, `savePreferences(patch: Partial<Preferences>): Preferences`.

- [ ] **Step 1: `src/lib/preferences.ts`:**

```ts
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
```

- [ ] **Step 2: `SweepConfigCard.tsx`.** Eliminar `type FreqUnit = ...` y `const DEFAULT_FREQ_UNIT: FreqUnit = 'kHz';`; importar `{ getPreferences, type FreqUnit }` desde `'../../lib/preferences'`. Dentro del componente, junto a los `useState` de unidades, agregar `const [defaultUnit] = useState<FreqUnit>(() => getPreferences().defaultFreqUnit);` y cambiar `getUnit` a `map[idx] ?? defaultUnit`. Actualizar el comentario "kHz por default" → "unidad por defecto de Preferencias (kHz si no se configuró)". Si `DEFAULT_FREQ_UNIT` se usa en otro lugar del archivo, reemplazarlo por `defaultUnit` (o, fuera del componente, por `getPreferences().defaultFreqUnit`).

- [ ] **Step 3: Verificar.** `npx tsc --noEmit -p tsconfig.app.json && npx vite build` → limpio.

- [ ] **Step 4: Commit.**

```bash
git add src/lib/preferences.ts src/components/task/SweepConfigCard.tsx
git commit -m "feat(settings): user preference for default frequency unit"
```

---

### Task 4: `SettingsPage` (Perfil / Preferencias / Sesión)

**Files:**
- Create: `SmartConcreteFrontend/src/pages/settings/SettingsPage.tsx`
- Create: `SmartConcreteFrontend/src/pages/settings/ChangePasswordForm.tsx`
- Create: `SmartConcreteFrontend/src/pages/settings/SessionPanel.tsx`
- Modify: `SmartConcreteFrontend/src/App.tsx` (ruta `/settings` dentro del bloque `PrivateLayout`)

**Interfaces:**
- Consumes: `POST /auth/change-password` (Task 1); `getPreferences`, `savePreferences`, `FREQ_UNITS`, `FreqUnit` (Task 3); `useAuth()` → `{ user: { name, lastName, email, roleNames?, provider? }, refreshToken(): Promise<boolean>, logout() }`; `useGetCurrentTeam()` de `src/hooks/useTeams.ts` (devuelve `{ data }` con `name`); `getJwtExpiry(token)` de `src/lib/jwt.ts`; `KronosTabs`, `KronosTabContent`, `KronosCard`, `KronosButton`, `KronosInput`, `KronosLayout`, `KronosPageHeader` de `src/components/kronos`.

- [ ] **Step 1: `ChangePasswordForm.tsx`:**

```tsx
import { useState } from 'react';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import apiClient from '../../api/client';
import { KronosButton, KronosInput } from '../../components/kronos';
import { getErrorMessage, type ApiErrorResponse } from '../../types/api';

const ChangePasswordForm = () => {
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
      await apiClient.post('/auth/change-password', { currentPassword: current, newPassword: next });
      toast.success('Contraseña actualizada');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err) {
      toast.error(getErrorMessage((err as AxiosError<ApiErrorResponse>).response?.data));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm space-y-3">
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
```

> Revisar la API de `KronosInput` (`src/components/kronos/kronos-input.tsx`): si no acepta `label`, envolver cada input en `<label className="block space-y-1 text-xs text-muted-foreground">Texto<KronosInput .../></label>`.

- [ ] **Step 2: `SessionPanel.tsx`:**

```tsx
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
```

- [ ] **Step 3: `SettingsPage.tsx`:**

```tsx
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
```

> Revisar el tipo de retorno real de `useGetCurrentTeam` y el campo del nombre del equipo; ajustar `team?.name` si difiere. Revisar que `user.roleNames` exista en el tipo `User` (`src/features/auth/types.ts`: sí, `roleNames?: string[]`).

- [ ] **Step 4: Ruta.** En `App.tsx`: `import SettingsPage from './pages/settings/SettingsPage';` y dentro del bloque `PrivateLayout`: `<Route path="/settings" element={<SettingsPage />} />`.

- [ ] **Step 5: Verificar.** `npx tsc --noEmit -p tsconfig.app.json && npx vite build` → limpio. Prueba manual (humana, pendiente): las 3 pestañas; cambiar la unidad y abrir el barrido de una tarea; contraseña actual errónea → toast del backend.

- [ ] **Step 6: Commit.**

```bash
git add src/pages/settings src/App.tsx
git commit -m "feat(settings): settings page with profile, preferences and session"
```

---

### Task 5: `HelpPage`

**Files:**
- Create: `SmartConcreteFrontend/src/pages/help/help-content.tsx`
- Create: `SmartConcreteFrontend/src/pages/help/HelpPage.tsx`
- Modify: `SmartConcreteFrontend/src/App.tsx` (ruta `/help`)

**Interfaces:**
- Consumes: `Accordion, AccordionItem, AccordionTrigger, AccordionContent` de `src/components/ui/accordion.tsx`; `KronosLayout, KronosPageHeader, KronosCard, KronosInput` de `src/components/kronos`.
- Produces: `HELP_SECTIONS: { id: string; title: string; keywords: string; body: ReactNode }[]`.

- [ ] **Step 1: `help-content.tsx`** (contenido completo; `keywords` es texto plano para el buscador):

```tsx
import type { ReactNode } from 'react';

export interface HelpSection { id: string; title: string; keywords: string; body: ReactNode }

const P = ({ children }: { children: ReactNode }) => <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
const Code = ({ children }: { children: ReactNode }) => <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">{children}</code>;

const ROLES: [string, string][] = [
  ['Super Administrador', 'Todo, incluidos roles, permisos y equipos.'],
  ['Administrador de Equipo', 'Gestiona miembros (aprobar, rechazar, roles), proyectos, tareas, dispositivos, mediciones y reportes del equipo.'],
  ['Gestor de Proyecto', 'Crea y edita proyectos, tareas y dispositivos; mide, programa y exporta reportes; agrega o quita miembros.'],
  ['Operario', 'Ve proyectos, tareas y dispositivos; ejecuta y programa mediciones; ve reportes (no exporta).'],
  ['Visualizador', 'Solo lectura: proyectos, tareas, dispositivos, mediciones y reportes.'],
];

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'primeros-pasos',
    title: 'Primeros pasos',
    keywords: 'empezar equipo proyecto dispositivo tarea medir unirse',
    body: (
      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        <li>Únete a un equipo y espera la aprobación de un administrador.</li>
        <li>Crea un proyecto (o pide acceso a uno existente).</li>
        <li>Registra los dispositivos del proyecto: el analizador de impedancia y el MUX, con su IP.</li>
        <li>Crea una tarea y asígnale un analizador y un MUX.</li>
        <li>Configura el barrido (rangos de frecuencia y canales) y pulsa medir, o programa mediciones en el calendario.</li>
      </ol>
    ),
  },
  {
    id: 'mediciones',
    title: 'Mediciones',
    keywords: 'barrido rango frecuencia hz khz mhz canales mux programar ocupado 409 calendario',
    body: (
      <div className="space-y-2">
        <P>Un barrido mide conductancia (G) y susceptancia (B) en Siemens en cada frecuencia del rango, para cada canal seleccionado del MUX. Puedes definir varios rangos; la frecuencia inicial debe ser menor que la final.</P>
        <P>La unidad (Hz, kHz, MHz) es solo de presentación: la base de datos siempre guarda Hz. Puedes cambiar la unidad por defecto en Configuración → Preferencias.</P>
        <P>Las mediciones programadas aparecen en el Calendario. Si un dispositivo ya está midiendo, la medición programada se pospone; una medición manual que choque con otra programada responde "dispositivo ocupado" (409).</P>
      </div>
    ),
  },
  {
    id: 'watcher',
    title: 'Kronos Watcher',
    keywords: 'watcher correcta advertencia error nulos cero anomalia estado',
    body: (
      <div className="space-y-2">
        <P>El Kronos Watcher revisa cada medición al terminar y la clasifica según el porcentaje de lecturas nulas (cero o casi cero) en los canales medidos:</P>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Correcta</strong>: menos del 30 % de lecturas nulas.</li>
          <li><strong className="text-foreground">Advertencia</strong>: entre 30 % y 80 % — posible problema de conexión o de muestra.</li>
          <li><strong className="text-foreground">Error</strong>: 80 % o más, o no se recibieron datos — sensor desconectado o sin señal.</li>
        </ul>
        <P>El resultado se guarda en cada medición, aparece en Actividad y Notificaciones, y se resume en los reportes.</P>
      </div>
    ),
  },
  {
    id: 'reportes',
    title: 'Reportes (PDF y CSV)',
    keywords: 'reporte pdf csv exportar descargar excel pandas columnas',
    body: (
      <div className="space-y-2">
        <P>En Reportes, cada tarea tiene un PDF (configuración del ensayo, resumen del Watcher, gráfico de la última medición, metadatos por canal y tabla de mediciones) y un CSV con todas sus mediciones. Exportar requiere el permiso de exportar reportes.</P>
        <P>El CSV está en formato largo: una fila por medición, frecuencia y canal. Columnas: <Code>measurement_id, taken_at, taken_by, preset, watcher_status, frequency_hz, channel, channel_alias, g_s, b_s, concrete_mix, has_emulsifier, sample_age, temperature, humidity, notes</Code>.</P>
        <P>Las primeras líneas empiezan con <Code>#</Code> y son metadatos. En Python: <Code>pd.read_csv(ruta, comment='#')</Code>.</P>
        <P>Los links "CSV" del PDF abren Kronos y piden iniciar sesión: un PDF reenviado a alguien sin cuenta no expone datos.</P>
      </div>
    ),
  },
  {
    id: 'roles',
    title: 'Roles y permisos',
    keywords: 'rol permiso administrador gestor operario visualizador acceso',
    body: (
      <div className="space-y-2">
        <table className="w-full text-sm">
          <tbody>
            {ROLES.map(([role, desc]) => (
              <tr key={role} className="border-b border-border last:border-0">
                <td className="py-1.5 pr-4 align-top font-medium text-foreground">{role}</td>
                <td className="py-1.5 text-muted-foreground">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <P>Además del rol, un administrador puede dar permisos extra a un miembro en un proyecto concreto.</P>
      </div>
    ),
  },
  {
    id: 'problemas',
    title: 'Problemas comunes',
    keywords: 'offline desconectado sesion expirada 401 nulos error ayuda problema',
    body: (
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li><strong className="text-foreground">Dispositivo offline</strong>: el servidor revisa la conexión cada 30 s. Verifica la IP, el cable de red y que el equipo esté encendido; usa "Test de conexión" en Dispositivos.</li>
        <li><strong className="text-foreground">"Tu sesión expiró"</strong>: vuelve a iniciar sesión; regresarás a la página en la que estabas. Puedes extender la sesión antes desde Configuración → Sesión.</li>
        <li><strong className="text-foreground">Medición con valores nulos</strong>: revisa la conexión de los electrodos y que los canales seleccionados tengan muestra.</li>
        <li><strong className="text-foreground">No puedo medir</strong>: la tarea necesita un analizador y un MUX asignados, y tu rol debe permitir ejecutar mediciones.</li>
      </ul>
    ),
  },
  {
    id: 'acerca',
    title: 'Acerca de Kronos',
    keywords: 'acerca version ieee 1876 laas laboratorio',
    body: (
      <P>Kronos es una plataforma de monitoreo de concreto mediante espectroscopía de impedancia. Su capa de dispositivos sigue el modelo Lab as a Service (LaaS) del estándar IEEE 1876-2019: cada instrumento se integra como un plugin que describe sus sensores y actuadores.</P>
    ),
  },
];
```

- [ ] **Step 2: `HelpPage.tsx`:**

```tsx
import { useMemo, useState } from 'react';
import { KronosLayout, KronosPageHeader, KronosCard, KronosInput } from '../../components/kronos';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/accordion';
import { HELP_SECTIONS } from './help-content';

const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const HelpPage = () => {
  const [query, setQuery] = useState('');
  const sections = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return HELP_SECTIONS;
    return HELP_SECTIONS.filter((s) => normalize(`${s.title} ${s.keywords}`).includes(q));
  }, [query]);

  return (
    <KronosLayout title="Ayuda" subtitle="Guía de uso de Kronos">
      <KronosPageHeader title="Ayuda" description="Cómo usar Kronos: mediciones, Kronos Watcher, reportes y permisos." />
      <div className="mb-4 max-w-md">
        <KronosInput placeholder="Buscar en la ayuda…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <KronosCard className="p-0">
        {sections.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Sin resultados para "{query}".</p>
        ) : (
          <Accordion type="multiple" defaultValue={query ? sections.map((s) => s.id) : ['primeros-pasos']} key={query ? 'search' : 'all'} className="px-4">
            {sections.map((s) => (
              <AccordionItem key={s.id} value={s.id}>
                <AccordionTrigger>{s.title}</AccordionTrigger>
                <AccordionContent>{s.body}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </KronosCard>
    </KronosLayout>
  );
};

export default HelpPage;
```

- [ ] **Step 3: Ruta.** En `App.tsx`: `import HelpPage from './pages/help/HelpPage';` y `<Route path="/help" element={<HelpPage />} />` en el bloque `PrivateLayout`.

- [ ] **Step 4: Verificar.** `npx tsc --noEmit -p tsconfig.app.json && npx vite build` → limpio.

- [ ] **Step 5: Commit.**

```bash
git add src/pages/help src/App.tsx
git commit -m "feat(help): help page with searchable guide"
```
