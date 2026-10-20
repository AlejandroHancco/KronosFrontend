# Settings, Help y loader "cardiograma" — Diseño

Fecha: 2026-10-19 · Aprobado por el usuario en conversación.
Repos: `SmartConcreteBackend` (`develop`), `SmartConcreteFrontend` (`master`).

## 1. `KronosLoader`
- SVG: cuadrícula tenue tipo monitor + traza con forma de **curva de barrido de impedancia** (línea base, pico de resonancia de G, valle, cola) que se dibuja de izquierda a derecha en bucle (~1,6 s) con un punto brillante en la punta y estela que se desvanece. Color `var(--primary)`; cuadrícula `var(--border)`.
- Texto opcional debajo (por defecto "Midiendo…" en tamaño página; "Cargando…" o el que pase el llamador en sección).
- Tamaños: `page` (reemplaza `LoadingSpinner`) y `section` (reemplaza los "Cargando…" de tablas/listas).
- `prefers-reduced-motion: reduce` → traza completa estática con pulso de opacidad suave.
- `role="status"` + `aria-label`.
- No se usa dentro de botones (se mantienen `Loader2`).

## 2. Settings (`/settings`)
`KronosTabs` con 3 pestañas:
- **Perfil**: nombre, apellido, email, roles (`user.roleNames`), equipo (`useGetCurrentTeam`). Si `user.provider === 'jwt'`: formulario **Cambiar contraseña** (actual, nueva, confirmar; nueva ≥ 8 caracteres y distinta de la actual) → `POST /auth/change-password`. Si no: aviso "Tu contraseña se gestiona en Google".
- **Preferencias**: unidad de frecuencia por defecto (Hz/kHz/MHz, por defecto kHz), guardada en `localStorage` (`kronos:prefs`); `SweepConfigCard` la usa como unidad inicial.
- **Sesión**: para JWT, tiempo restante (actualizado cada 30 s) + "Extender sesión" (`refreshToken`); para Google, "Tu sesión se renueva automáticamente". Botón "Cerrar sesión" para todos.

### Backend: `POST /auth/change-password`
- Guard `JwtAuthGuard`; throttle 5/min.
- Body `{ currentPassword: string; newPassword: string }` (DTO con `class-validator`: strings, `newPassword` MinLength 8).
- 400 si el usuario no tiene contraseña local ("Tu cuenta usa Google; no tiene contraseña local"), 400 si la actual no coincide ("La contraseña actual es incorrecta"), 400 si nueva == actual. Hash bcrypt (10 rondas, igual que `register`). Responde `{ ok: true }`.

## 3. Help (`/help`)
Contenido estático en español en un `Accordion`, con buscador que filtra secciones por título/texto. Secciones: Primeros pasos; Mediciones; Kronos Watcher (umbrales 30 % / 80 % de lecturas nulas); Reportes (PDF, columnas del CSV, `pd.read_csv(f, comment='#')`); Roles y permisos (tabla de los 5 roles); Problemas comunes; Acerca de.

## Fuera de alcance
Preferencias de notificaciones, pestaña Sistema, atajos de teclado.
