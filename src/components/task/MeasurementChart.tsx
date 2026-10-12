import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MeasurementDetail, MeasureResponse } from '../../types/measurement.types';

interface MeasurementChartProps {
  measurementData: MeasurementDetail | MeasureResponse | undefined;
  visibleChannels: number[];
  isLoading: boolean;
}

const formatFrequency = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
};

// Paleta categórica validada (CVD-safe) contra las superficies reales de esta app —
// los tokens --chart-1..5 del proyecto no pasan el validador (dos tonos naranja
// casi indistinguibles), así que se usa esta en su lugar para las series de datos.
// La app corre siempre en modo oscuro (ver main.tsx), por eso son los pasos "dark".
const CHANNEL_COLORS = [
  '#3987e5', // azul
  '#d95926', // naranja
  '#199e70', // aqua
  '#c98500', // amarillo
  '#d55181', // magenta
  '#008300', // verde
  '#9085e9', // violeta
  '#e66767', // rojo
];

const getChannelColor = (channel: number) => CHANNEL_COLORS[(channel - 1) % CHANNEL_COLORS.length];

// G y B comparten la misma unidad (S) y van en un solo eje Y — nunca un eje dual.
// El color identifica el canal; sólido vs. punteado distingue G de B (encoding
// secundario, ya que el color ya está ocupado por la identidad del canal).
const B_DASH = '5 3';

interface CustomTooltipPayloadEntry {
  value: number;
  name: string;
  color?: string;
  dataKey?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayloadEntry[];
  label?: number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-border bg-popover p-2.5 text-popover-foreground shadow-md">
      <p className="mb-1.5 text-xs font-medium text-foreground">
        {formatFrequency(Number(label))} Hz
      </p>
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const isB = typeof entry.dataKey === 'string' && entry.dataKey.startsWith('b');
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span
                className="h-0 w-3 shrink-0"
                style={{
                  borderTopWidth: 2,
                  borderTopColor: entry.color,
                  borderTopStyle: isB ? 'dashed' : 'solid',
                }}
              />
              <span className="text-foreground">{entry.name}</span>
              <span className="ml-auto font-semibold tabular-nums text-foreground">
                {entry.value?.toFixed(6)} S
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Leyenda: siempre visible con >=2 series — el color nunca es la única clave de identidad. */
const ChartLegend = ({ channels }: { channels: number[] }) => (
  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-1">
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {channels.map((channel) => (
        <div key={channel} className="flex items-center gap-1.5 text-xs text-foreground">
          <span
            className="h-[2px] w-4 shrink-0 rounded-full"
            style={{ backgroundColor: getChannelColor(channel) }}
          />
          Canal {channel}
        </div>
      ))}
    </div>
    <div className="flex items-center gap-3 text-xs text-foreground">
      <span className="flex items-center gap-1.5">
        <span className="h-0 w-4 shrink-0 border-t-2 border-foreground" />
        G
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="h-0 w-4 shrink-0 border-t-2 border-foreground"
          style={{ borderTopStyle: 'dashed' }}
        />
        B
      </span>
    </div>
  </div>
);

const MeasurementChart = ({ measurementData, visibleChannels, isLoading }: MeasurementChartProps) => {
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!measurementData?.data) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
        Selecciona una medición para ver el gráfico
      </div>
    );
  }

  if (visibleChannels.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
        Selecciona al menos un canal para visualizar
      </div>
    );
  }

  // Solo mostrar canales que tienen datos reales (al menos un punto != 0)
  const channelsWithData = visibleChannels.filter((ch) =>
    measurementData.data.some((point) => point.g[ch - 1] !== 0 || point.b[ch - 1] !== 0),
  );

  if (channelsWithData.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
        Esta medición no tiene valores registrados para los canales seleccionados
      </div>
    );
  }

  const chartData = measurementData.data.map((point) => {
    const row: Record<string, number> = { frequency: point.frequency };
    channelsWithData.forEach((ch) => {
      row[`g${ch}`] = point.g[ch - 1];
      row[`b${ch}`] = point.b[ch - 1];
    });
    return row;
  });

  return (
    <div className="space-y-2">
      <ChartLegend channels={channelsWithData} />
      <div className="flex gap-1">
        {/* Título del eje Y como texto HTML normal — fuera del SVG, color 100% garantizado */}
        <div className="flex shrink-0 items-center justify-center" style={{ width: 16 }}>
          <span
            className="whitespace-nowrap text-[11px] text-foreground"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            S (Siemens)
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

                <XAxis
                  dataKey="frequency"
                  tickFormatter={formatFrequency}
                  stroke="var(--border)"
                  tick={{ fill: 'var(--foreground)', fontSize: 11 }}
                  tickLine={false}
                  height={24}
                />

                <YAxis
                  stroke="var(--border)"
                  tick={{ fill: 'var(--foreground)', fontSize: 11 }}
                  tickLine={false}
                  width={60}
                  tickFormatter={(v: number) => v.toExponential(1)}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                />

                {channelsWithData.map((channel) => (
                  <Line
                    key={`g${channel}`}
                    type="linear"
                    dataKey={`g${channel}`}
                    stroke={getChannelColor(channel)}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                    name={`Canal ${channel} · G`}
                  />
                ))}

                {channelsWithData.map((channel) => (
                  <Line
                    key={`b${channel}`}
                    type="linear"
                    dataKey={`b${channel}`}
                    stroke={getChannelColor(channel)}
                    strokeWidth={2}
                    strokeDasharray={B_DASH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                    name={`Canal ${channel} · B`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-center text-[11px] text-foreground">Frecuencia (Hz)</p>
        </div>
      </div>
    </div>
  );
};

export default MeasurementChart;
