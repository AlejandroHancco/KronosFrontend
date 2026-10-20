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
    keywords: 'empezar equipo proyecto dispositivo tarea medir unirse analizador mux ip barrido calendario',
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
    keywords: 'barrido rango frecuencia hz khz mhz canales mux programar cola 409 calendario conductancia susceptancia siemens',
    body: (
      <div className="space-y-2">
        <P>Un barrido mide conductancia (G) y susceptancia (B) en Siemens en cada frecuencia del rango, para cada canal seleccionado del MUX. Puedes definir varios rangos; la frecuencia inicial debe ser menor que la final.</P>
        <P>La unidad (Hz, kHz, MHz) es solo de presentación: la base de datos siempre guarda Hz. Puedes cambiar la unidad por defecto en Configuración → Preferencias.</P>
        <P>Las mediciones programadas aparecen en el Calendario; si un dispositivo ya está midiendo, la medición programada se pospone. Una medición manual puede ser rechazada (409) si chocaría con una medición programada en los mismos dispositivos o si la cola de mediciones pendientes está llena; el mensaje de error indica el motivo y cuándo reintentar.</P>
      </div>
    ),
  },
  {
    id: 'watcher',
    title: 'Kronos Watcher',
    keywords: 'watcher correcta advertencia error nulos cero anomalia estado lecturas conexion sensor desconectado señal',
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
    keywords: 'reporte pdf csv exportar descargar excel pandas columnas python notas metadatos grafico google sesion',
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
    keywords: 'rol permiso administrador gestor operario visualizador acceso eliminar borrar',
    body: (
      <div className="space-y-2">
        <P>Estos son los permisos por defecto de cada rol; un administrador puede cambiarlos. El Gestor de Proyecto, además de lo listado, puede eliminar proyectos, tareas y mediciones.</P>
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
    keywords: 'offline desconectado sesion expirada 401 nulos error ayuda problema electrodos ip contraseña password cambio',
    body: (
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li><strong className="text-foreground">Dispositivo offline</strong>: el servidor revisa la conexión cada 30 s. Verifica la IP, el cable de red y que el equipo esté encendido; usa el botón "Probar Conexión" en el detalle de la tarea para confirmarlo.</li>
        <li><strong className="text-foreground">"Tu sesión expiró"</strong>: vuelve a iniciar sesión; regresarás a la página en la que estabas. Puedes extender la sesión antes desde Configuración → Sesión.</li>
        <li><strong className="text-foreground">Medición con valores nulos</strong>: revisa la conexión de los electrodos y que los canales seleccionados tengan muestra.</li>
        <li><strong className="text-foreground">No puedo medir</strong>: la tarea necesita un analizador y un MUX asignados, y tu rol debe permitir ejecutar mediciones.</li>
        <li><strong className="text-foreground">Cambié mi contraseña y se cerró otra sesión</strong>: es esperado, por seguridad se cierran las sesiones de otros dispositivos; vuelve a iniciar sesión ahí con la nueva contraseña.</li>
      </ul>
    ),
  },
  {
    id: 'acerca',
    title: 'Acerca de Kronos',
    keywords: 'acerca version ieee 1876 laas laboratorio impedancia plugin sensores actuadores',
    body: (
      <P>Kronos es una plataforma de monitoreo de concreto mediante espectroscopía de impedancia. Su capa de dispositivos sigue el modelo Lab as a Service (LaaS) del estándar IEEE 1876-2019: cada instrumento se integra como un plugin que describe sus sensores y actuadores.</P>
    ),
  },
];
