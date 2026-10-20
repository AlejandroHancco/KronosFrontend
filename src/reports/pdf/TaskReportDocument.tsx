import { Document, Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import type { TaskReportData } from '../../types/report.types';
import MeasurementChartPdf from './MeasurementChartPdf';
import { channelColor, formatDate, formatFreq, publicUrl, WATCHER_PDF } from './format';

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 9, color: '#111827', fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  logo: { width: 26, height: 26, borderRadius: 5, backgroundColor: '#111827', color: '#ffffff', fontSize: 16, fontFamily: 'Helvetica-Bold', textAlign: 'center', paddingTop: 4 },
  title: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
  muted: { color: '#6b7280' },
  section: { marginTop: 14 },
  h2: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 3 },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb', paddingVertical: 3 },
  th: { fontFamily: 'Helvetica-Bold', color: '#374151' },
  kv: { flexDirection: 'row', marginBottom: 2 },
  k: { width: 110, color: '#6b7280' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, fontSize: 7, color: '#9ca3af', textAlign: 'center' },
});

const KV = ({ k, v }: { k: string; v: string }) => (
  <View style={s.kv}><Text style={s.k}>{k}</Text><Text>{v}</Text></View>
);

const cell = (flex: number) => ({ flex, paddingRight: 4 });

const TaskReportDocument = ({ data, generatedBy }: { data: TaskReportData; generatedBy: string }) => {
  const ms = data.measurements;
  const first = ms[0]?.takenAt ?? null;
  const last = ms[ms.length - 1]?.takenAt ?? null;
  const counts = { correct: 0, warning: 0, error: 0 } as Record<string, number>;
  const reasons = new Map<string, number>();
  for (const m of ms) {
    if (m.watcherStatus) counts[m.watcherStatus]++;
    if (m.watcherReason) reasons.set(m.watcherReason, (reasons.get(m.watcherReason) ?? 0) + 1);
  }
  const latestChannels = data.latest?.channels.map((c) => c.channelNumber).sort((a, b) => a - b) ?? [];
  const base = publicUrl();

  return (
    <Document title={`Reporte ${data.task.name}`} author="Kronos">
      <Page size="A4" style={s.page}>
        {/* 1. Encabezado */}
        <View style={s.header}>
          <Text style={s.logo}>K</Text>
          <View>
            <Text style={s.title}>Reporte de tarea</Text>
            <Text style={s.muted}>{data.project.name} · {data.task.name}</Text>
          </View>
        </View>
        <KV k="Generado por" v={`${generatedBy} — ${formatDate(new Date().toISOString())}`} />
        <KV k="Período" v={`${formatDate(first)} — ${formatDate(last)}`} />
        <KV k="Mediciones" v={String(ms.length)} />
        {(data.range.from || data.range.to) && (
          <KV k="Filtro de fechas" v={`${formatDate(data.range.from)} — ${formatDate(data.range.to)}`} />
        )}

        {/* 2. Configuración */}
        <View style={s.section}>
          <Text style={s.h2}>Configuración del ensayo</Text>
          {data.preference ? (
            <>
              <KV k="Preset" v={data.preference.name} />
              <KV k="Analizador" v={`${data.preference.analyzer.name} (${data.preference.analyzer.ip ?? 'sin IP'})`} />
              <KV k="MUX" v={`${data.preference.mux.name} (${data.preference.mux.ip ?? 'sin IP'})`} />
              <KV k="Canales (última)" v={latestChannels.join(', ') || '—'} />
              <View style={[s.row, { marginTop: 4 }]}>
                <Text style={[s.th, cell(1)]}>Inicio</Text><Text style={[s.th, cell(1)]}>Fin</Text>
                <Text style={[s.th, cell(1)]}>Puntos</Text><Text style={[s.th, cell(1)]}>Barrido</Text>
              </View>
              {data.preference.ranges.map((r, i) => (
                <View key={i} style={s.row}>
                  <Text style={cell(1)}>{formatFreq(r.startFreq)}</Text><Text style={cell(1)}>{formatFreq(r.stopFreq)}</Text>
                  <Text style={cell(1)}>{r.points}</Text><Text style={cell(1)}>{r.sweepType}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={s.muted}>La tarea no tiene analizador/MUX configurados.</Text>
          )}
        </View>

        {/* 3. Kronos Watcher */}
        <View style={s.section}>
          <Text style={s.h2}>Resumen Kronos Watcher</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {Object.entries(WATCHER_PDF).map(([key, w]) => (
              <Text key={key} style={{ color: w.color }}>{w.label}: {counts[key]}</Text>
            ))}
          </View>
          {[...reasons.entries()].map(([reason, n]) => (
            <Text key={reason} style={[s.muted, { marginTop: 2 }]}>• {reason} ({n})</Text>
          ))}
        </View>

        {/* 4. Gráfico */}
        {data.latest && data.latest.data.length > 1 && (
          <View style={s.section} wrap={false}>
            <Text style={s.h2}>Última medición (#{data.latest.id} — {formatDate(data.latest.takenAt)})</Text>
            <MeasurementChartPdf data={data.latest.data} channels={latestChannels} log={data.latest.sweepType === 'LOG'} />
            <View style={s.legend}>
              {latestChannels.map((ch) => (
                <Text key={ch} style={{ color: channelColor(ch) }}>■ Canal {ch}</Text>
              ))}
              <Text style={s.muted}>— G (conductancia)   - - B (susceptancia)</Text>
            </View>
          </View>
        )}

        {/* 5. Metadatos por canal */}
        {data.latest && data.latest.channels.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.h2}>Metadatos por canal (última medición)</Text>
            <View style={s.row}>
              {['Canal', 'Alias', 'Mezcla', 'Emuls.', 'Edad (d)', 'Temp. °C', 'Hum. %'].map((h) => (
                <Text key={h} style={[s.th, cell(1)]}>{h}</Text>
              ))}
            </View>
            {[...data.latest.channels].sort((a, b) => a.channelNumber - b.channelNumber).map((c) => (
              <View key={c.channelNumber} style={s.row}>
                <Text style={cell(1)}>{c.channelNumber}</Text>
                <Text style={cell(1)}>{c.channelAlias ?? '—'}</Text>
                <Text style={cell(1)}>{c.concreteMix ?? '—'}</Text>
                <Text style={cell(1)}>{c.hasEmulsifier === null ? '—' : c.hasEmulsifier ? 'Sí' : 'No'}</Text>
                <Text style={cell(1)}>{c.sampleAge ?? '—'}</Text>
                <Text style={cell(1)}>{c.temperature ?? '—'}</Text>
                <Text style={cell(1)}>{c.humidity ?? '—'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 6. Tabla de mediciones */}
        <View style={s.section}>
          <Text style={s.h2}>Mediciones</Text>
          <View style={s.row} fixed>
            <Text style={[s.th, cell(0.5)]}>#</Text><Text style={[s.th, cell(1.3)]}>Fecha</Text>
            <Text style={[s.th, cell(1.3)]}>Tomada por</Text><Text style={[s.th, cell(1)]}>Preset</Text>
            <Text style={[s.th, cell(0.9)]}>Estado</Text><Text style={[s.th, cell(2)]}>Motivo</Text>
            <Text style={[s.th, cell(0.5)]}>CSV</Text>
          </View>
          {ms.map((m) => {
            const w = m.watcherStatus ? WATCHER_PDF[m.watcherStatus] : null;
            return (
              <View key={m.id} style={s.row} wrap={false}>
                <Text style={cell(0.5)}>{m.id}</Text>
                <Text style={cell(1.3)}>{formatDate(m.takenAt)}</Text>
                <Text style={cell(1.3)}>{m.takenByName ?? '—'}</Text>
                <Text style={cell(1)}>{m.presetName ?? '—'}</Text>
                <Text style={[cell(0.9), { color: w?.color ?? '#6b7280' }]}>{w?.label ?? '—'}</Text>
                <Text style={[cell(2), s.muted]}>{m.watcherReason ?? ''}</Text>
                <Link style={[cell(0.5), { color: '#2563eb' }]} src={`${base}/measurements/${m.id}/csv`}>CSV</Link>
              </View>
            );
          })}
        </View>

        <Text style={s.footer} render={({ pageNumber, totalPages }) => `Kronos — página ${pageNumber} de ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};

export default TaskReportDocument;
