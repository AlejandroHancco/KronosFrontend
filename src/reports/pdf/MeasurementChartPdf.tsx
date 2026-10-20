import { Svg, Path, Line, Text as SvgText, G } from '@react-pdf/renderer';
import type { ReportPoint } from '../../types/report.types';
import { channelColor, formatFreq, formatSci } from './format';

interface Props { data: ReportPoint[]; channels: number[]; log: boolean; width?: number; height?: number }

const PAD = { top: 10, right: 12, bottom: 28, left: 48 };

/** Min/max en una sola pasada; evita el límite de argumentos de Math.min/max(...arr) en arreglos grandes. */
function extent(arr: number[]): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const v of arr) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return [min, max];
}

const MeasurementChartPdf = ({ data, channels, log, width = 515, height = 230 }: Props) => {
  const freqs = data.map((p) => p.frequency).filter((f) => f > 0);
  if (freqs.length < 2 || channels.length === 0) return null;

  const values = data.flatMap((p) => channels.flatMap((c) => [p.g[c - 1] ?? 0, p.b[c - 1] ?? 0]));
  let [yMin, yMax] = extent(values);
  if (yMin === yMax) { yMin -= 1; yMax += 1; }

  const fx = log ? Math.log10 : (v: number) => v;
  const [freqMin, freqMax] = extent(freqs);
  const xMin = fx(freqMin);
  const xMax = fx(freqMax);
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const sx = (f: number) => PAD.left + ((fx(f) - xMin) / (xMax - xMin || 1)) * plotW;
  const sy = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const path = (key: 'g' | 'b', ch: number) =>
    data
      .filter((p) => p.frequency > 0)
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.frequency).toFixed(1)},${sy(p[key][ch - 1] ?? 0).toFixed(1)}`)
      .join(' ');

  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4);
  const xTicks = Array.from({ length: 5 }, (_, i) => {
    const t = xMin + ((xMax - xMin) * i) / 4;
    return log ? 10 ** t : t;
  });

  return (
    <Svg width={width} height={height}>
      {yTicks.map((v) => (
        <G key={`y${v}`}>
          <Line x1={PAD.left} x2={width - PAD.right} y1={sy(v)} y2={sy(v)} stroke="#e5e7eb" strokeWidth={0.5} />
          <SvgText x={PAD.left - 4} y={sy(v) + 2.5} style={{ fontSize: 6 }} fill="#374151" textAnchor="end">{formatSci(v)}</SvgText>
        </G>
      ))}
      {xTicks.map((f) => (
        <SvgText key={`x${f}`} x={sx(f)} y={height - PAD.bottom + 10} style={{ fontSize: 6 }} fill="#374151" textAnchor="middle">
          {formatFreq(f)}
        </SvgText>
      ))}
      <Line x1={PAD.left} x2={width - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke="#9ca3af" strokeWidth={0.7} />
      <Line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + plotH} stroke="#9ca3af" strokeWidth={0.7} />
      <SvgText x={PAD.left + plotW / 2} y={height - 4} style={{ fontSize: 7 }} fill="#111827" textAnchor="middle">
        Frecuencia (Hz){log ? ' — escala logarítmica' : ''}
      </SvgText>
      <SvgText x={4} y={PAD.top + 4} style={{ fontSize: 7 }} fill="#111827">S</SvgText>
      {channels.map((ch) => (
        <G key={ch}>
          <Path d={path('g', ch)} stroke={channelColor(ch)} strokeWidth={1} fill="none" />
          <Path d={path('b', ch)} stroke={channelColor(ch)} strokeWidth={1} strokeDasharray="3,2" fill="none" />
        </G>
      ))}
    </Svg>
  );
};

export default MeasurementChartPdf;
