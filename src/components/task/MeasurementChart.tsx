import {
  ComposedChart,
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
  if (value >= 1000)    return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string }>;
  label?: number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
        <div className="bg-slate-800 border border-slate-600 rounded p-3 text-white">
          <p className="font-medium">{`Frequency: ${formatFrequency(Number(label))} Hz`}</p>
          {payload.map((entry, index) => (
              <p key={index} style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value?.toFixed(6)} S`}
              </p>
          ))}
        </div>
    );
  }
  return null;
};

const gColors = [
  '#00ff00', '#00dd00', '#00bb00', '#009900',
  '#00ff88', '#00dd77', '#00bb66', '#009955',
  '#88ff00', '#77dd00', '#66bb00', '#559900',
  '#00ffcc', '#00ddaa', '#00bb88', '#009966',
];

const bColors = [
  '#ffff00', '#ffdd00', '#ffbb00', '#ff9900',
  '#ffff88', '#ffdd77', '#ffbb66', '#ff9955',
  '#ffcc00', '#ffaa00', '#ff8800', '#ff6600',
  '#ffffcc', '#ffddaa', '#ffbb88', '#ff9966',
];

const MeasurementChart = ({ measurementData, visibleChannels, isLoading }: MeasurementChartProps) => {
  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
    );
  }

  if (!measurementData?.data) {
    return (
        <div className="flex justify-center items-center h-96 text-slate-400">
          Selecciona una medición para ver el gráfico
        </div>
    );
  }

  if (visibleChannels.length === 0) {
    return (
        <div className="flex justify-center items-center h-96 text-slate-400">
          Selecciona al menos un canal para visualizar
        </div>
    );
  }

  // Detectar escala: LOG si sweepType === 'LOG', LIN en cualquier otro caso
  const isLogScale =
      (measurementData as MeasurementDetail)?.sweepType === 'LOG' ||
      (measurementData as MeasureResponse)?.sweepType === 'LOG';

  // Solo mostrar canales que tienen datos reales (al menos un punto != 0)
  const channelsWithData = visibleChannels.filter(ch =>
      measurementData.data.some(point => point.g[ch - 1] !== 0 || point.b[ch - 1] !== 0)
  );

  const chartData = measurementData.data.map((point) => {
    const row: Record<string, number> = { frequency: point.frequency };
    channelsWithData.forEach(ch => {
      row[`g${ch}`] = point.g[ch - 1];
      row[`b${ch}`] = point.b[ch - 1];
    });
    return row;
  });

  return (
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

            <XAxis
                dataKey="frequency"
                scale={isLogScale ? 'log' : 'linear'}
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatFrequency}
                stroke="#9ca3af"
                fontSize={12}
            />

            <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#00ff00"
                fontSize={12}
                label={{
                  value: 'G(S)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#00ff00' },
                }}
            />

            <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#ffff00"
                fontSize={12}
                label={{
                  value: 'B(S)',
                  angle: 90,
                  position: 'insideRight',
                  style: { textAnchor: 'middle', fill: '#ffff00' },
                }}
            />

            <Tooltip content={<CustomTooltip />} />

            {channelsWithData.map((channel) => (
                <Line
                    key={`g${channel}`}
                    yAxisId="left"
                    type="linear"
                    dataKey={`g${channel}`}
                    stroke={gColors[channel - 1]}
                    strokeWidth={1.5}
                    dot={false}
                    name={`G Canal ${channel}`}
                />
            ))}

            {channelsWithData.map((channel) => (
                <Line
                    key={`b${channel}`}
                    yAxisId="right"
                    type="linear"
                    dataKey={`b${channel}`}
                    stroke={bColors[channel - 1]}
                    strokeWidth={1.5}
                    dot={false}
                    name={`B Canal ${channel}`}
                />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
  );
};

export default MeasurementChart;