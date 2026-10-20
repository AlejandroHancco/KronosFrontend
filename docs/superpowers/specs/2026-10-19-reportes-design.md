# Reportes por tarea (PDF + CSV) — Diseño

Fecha: 2026-10-19
Repos afectados: `SmartConcreteBackend` (rama `develop`), `SmartConcreteFrontend` (rama `master`)

## Objetivo

Que un miembro del equipo pueda, por cada tarea:
1. Generar un **reporte PDF** con la configuración del ensayo, el resumen del Kronos Watcher, el gráfico de la última medición, los metadatos por canal y la lista de mediciones.
2. Descargar el **CSV de cada medición** y un **CSV consolidado de toda la tarea**.

Fuera de alcance (por ahora): gráfico de evolución temporal, anexo estadístico, reportes programados/automáticos, páginas Help y Settings (diseño aparte).

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| CSV | Generado al vuelo desde la DB; nada se guarda en disco. |
| Links de CSV dentro del PDF | Apuntan al **frontend** (`<VITE_PUBLIC_URL>/measurements/:id/csv`); exigen sesión. Un PDF reenviado a alguien sin cuenta no filtra datos. |
| Generación del PDF | En el **navegador** con `@react-pdf/renderer` (el backend corre en Raspberry; no se le agrega carga). |
| Estado del Watcher por medición | **Persistido** en una columna nueva (`watcherStatus` + `watcherReason`), se calcula al medir; las mediciones existentes se rellenan con un script. |
| Permisos | `/reports` exige `report:view`; generar PDF/CSV exige `report:export` (ambos ya existen en el seed). |
| Inyección de fórmulas CSV | Toda celda de texto que empiece con `=`, `+`, `-`, `@`, tab o CR se prefija con `'`. |

## 1. Backend

### 1.1 Schema: estado del Watcher en `Measurement`

```prisma
model Measurement {
  ...
  watcherStatus  String?  @db.VarChar(10)   // 'correct' | 'warning' | 'error'
  watcherReason  String?  @db.VarChar(300)
}
```

- Migración manual (patrón establecido del proyecto): SQL `ALTER TABLE "measurements" ADD COLUMN ...`, aplicado con `prisma migrate deploy`.
- Nullable: `null` = medición anterior al backfill que no pudo clasificarse.
- En `measureTask()` (`measurements.service.ts`, donde hoy se llama `classifyMeasurement`), se guarda `severity` y `reason` en la medición recién creada, antes de notificar.

**Backfill** (script one-off, no se commitea): para cada medición con `watcherStatus IS NULL`, `measuredChannels` = `channelNumber` de sus filas en `measurement_channels` (todas las 32 actuales tienen al menos una); ejecuta `classifyMeasurement(data, measuredChannels)` y guarda el resultado. Resultado esperado hoy: las 7 mediciones con `data = []` quedan como `error` / "No se recibieron datos de medición".

### 1.2 Módulo `reports` (nuevo)

`src/reports/` con `reports.module.ts`, `reports.controller.ts`, `reports.service.ts`, `csv.util.ts`.
Guards: `JwtAuthGuard` + `PermissionGuard`; acceso por equipo con `teamScope.assertTaskInTeam` / `assertMeasurementInTeam` (mismo patrón que `measurements`).

| Endpoint | Permiso | Devuelve |
|---|---|---|
| `GET /reports/tasks?projectId=` | `report:view` | Tareas del equipo: proyecto, tarea, nº de mediciones, última medición, conteo por `watcherStatus`. |
| `GET /reports/task/:taskId?from=&to=` | `report:export` | Datos del PDF: tarea, proyecto, preferencia activa (analizador, MUX, canales, rangos), lista de mediciones **sin** `data` (id, fecha, quién, preset, estado, motivo), metadatos por canal de cada medición, y la **última medición completa** (con `data`) para el gráfico. `from`/`to` filtran por `takenAt` (ISO, opcionales). |
| `GET /reports/measurement/:id/csv` | `report:export` | CSV de una medición. |
| `GET /reports/task/:taskId/csv?from=&to=` | `report:export` | CSV consolidado de la tarea (todas las mediciones del rango). |

Respuestas CSV: `Content-Type: text/csv; charset=utf-8`, BOM UTF-8 (para que Excel lea tildes), `Content-Disposition: attachment; filename="kronos_<tarea-slug>_<id|todo>_<yyyymmdd>.csv"`.

### 1.3 Formato CSV

Formato largo, una fila por (medición, frecuencia, canal medido):

```
# Kronos | Proyecto: Edificio X | Tarea: Viga A
# Generado: 2026-10-19 20:15 | Rango: todo
measurement_id,taken_at,taken_by,preset,watcher_status,frequency_hz,channel,channel_alias,g_s,b_s,concrete_mix,has_emulsifier,sample_age,temperature,humidity
32,2026-10-12T14:03:00Z,Alejandro Hancco,Default,correct,1000,1,Muestra A,0.00123,0.00045,0.45,false,7,22.5,60
```

- Solo se emiten los canales con fila en `measurement_channels` (los demás slots del array de 16 son 0 por diseño).
- El CSV por medición usa las mismas columnas (así ambos archivos se pueden concatenar).
- `csv.util.ts` expone `toCsvCell(value)` (escapa comillas, comas, saltos de línea y aplica la protección de fórmulas) y `toCsvRow(values[])`.
- Mediciones con `data = []` no generan filas de datos (el consolidado las omite; el CSV individual sale solo con encabezado).

## 2. Frontend

### 2.1 Configuración
- Nueva variable `VITE_PUBLIC_URL` (ej. `https://kronos.ejemplo.com`); si falta, se usa `window.location.origin`.
- Dependencia nueva: `@react-pdf/renderer`.

### 2.2 Rutas nuevas (dentro de las rutas privadas)
- `/reports` → `ReportsPage`. Si el usuario no tiene `report:view`, el item del sidebar se oculta y la ruta redirige a `/403`.
- `/measurements/:id/csv` → `CsvDownloadPage`: llama `GET /reports/measurement/:id/csv` con el token, dispara la descarga (blob + `<a download>`), muestra "Descarga iniciada" y un botón para volver. Si no hay sesión, el flujo existente de rutas privadas manda al login y vuelve aquí. Errores: 403 → "No tienes permiso para exportar", 404 → "La medición no existe".

### 2.3 `ReportsPage`
- `KronosTable` con columnas: Proyecto, Tarea, Mediciones, Última medición, Estado (chips con conteo correct/warning/error).
- Filtro por proyecto (select) arriba.
- Acciones por fila:
  - **Generar PDF** → abre `ReportOptionsModal`: rango de fechas (opcional, por defecto "todo") → genera y descarga el PDF.
  - **CSV (todo)** → descarga el consolidado con el mismo rango.
  - **Ver mediciones** → fila expandible con la lista de mediciones (fecha, estado, botón CSV).
- Tarea sin mediciones (en el rango): botones deshabilitados con tooltip "Esta tarea no tiene mediciones".
- Botones de exportar ocultos si falta `report:export`.

### 2.4 `TaskDetailPage`
- Botón "Descargar reporte PDF" en el encabezado (abre el mismo `ReportOptionsModal`).
- Botón "CSV" junto a cada medición del historial.

### 2.5 PDF (`src/reports/pdf/`)
Componentes `@react-pdf/renderer`, tamaño A4, fondo blanco, textos en español, frecuencias formateadas en Hz/kHz/MHz como en la app.

1. **Encabezado**: logo K, "Reporte de tarea", proyecto, tarea, generado por / fecha, período cubierto (primera–última medición del rango), nº de mediciones.
2. **Configuración del ensayo**: analizador (nombre, IP), MUX (nombre, IP), canales, tabla de rangos (inicio, fin, puntos, tipo de barrido).
3. **Resumen Kronos Watcher**: conteo correct/warning/error + lista de motivos distintos con su frecuencia.
4. **Última medición**: gráfico G y B vs frecuencia (`MeasurementChartPdf`, dibujado con primitivas `Svg`/`Path`/`Line`/`Text`: ejes, ticks, una línea por canal con la paleta de la app adaptada a fondo blanco, G sólida y B punteada, leyenda). Eje X logarítmico si `sweepType = LOG`.
5. **Metadatos por canal** (de la última medición): canal, alias, mezcla, emulsificante, edad, temperatura, humedad, notas.
6. **Tabla de mediciones**: fecha, tomada por, preset, estado (color), motivo, link "CSV" → `<VITE_PUBLIC_URL>/measurements/:id/csv`.
7. Pie de página: "Kronos — página X de Y".

Nombre del archivo: `reporte_<tarea-slug>_<yyyymmdd>.pdf`.

## 3. Manejo de errores
- Backend: 403 (falta el permiso), 404 (el recurso no existe **o** pertenece a otro equipo — deliberadamente indistinguible, para que no se puedan sondear IDs de otros equipos; consistente con `TeamScopeService`, usado en toda la app), 400 (`from`/`to` inválidos o `from > to`).
- Frontend: toasts con el mensaje real del backend (`getErrorMessage`, patrón existente); spinner en el botón mientras se genera el PDF; si la generación falla, toast "No se pudo generar el PDF".

## 4. Pruebas
- Backend: tests unitarios de `csv.util.ts` (escape de comillas/comas/saltos, protección de fórmulas) y del armado de filas CSV a partir de un `data` de ejemplo; `tsc --noEmit`.
- Verificación manual: endpoints con curl (200 con permiso, 403 sin permiso, 404 con medición de otro equipo), CSV abierto en Excel (tildes y columnas correctas), PDF generado para una tarea con mediciones y para una con mediciones vacías, link CSV del PDF abriendo el login cuando no hay sesión.
- Frontend: `tsc --noEmit` y `vite build`.

## 5. Orden de implementación
1. Migración `watcherStatus`/`watcherReason` + guardado en `measureTask()` + backfill.
2. Módulo `reports` (endpoints + CSV).
3. Frontend: `CsvDownloadPage` + `ReportsPage` + botones en `TaskDetailPage`.
4. PDF (`@react-pdf/renderer` + `MeasurementChartPdf`).
