import type { MeasurementSummary } from '../../types/measurement.types';
import { KronosCard, KronosBadge } from '../kronos';
import { History, Calendar, Cpu } from 'lucide-react';

interface MeasurementHistoryProps {
  measurements: MeasurementSummary[];
  onSelectMeasurement: (id: number) => void;
  selectedId: number | null;
}

const MeasurementHistory = ({ measurements, onSelectMeasurement, selectedId }: MeasurementHistoryProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFreq = (freq: number) => {
    if (freq >= 1_000_000) return `${(freq / 1_000_000).toFixed(1)}M`;
    if (freq >= 1_000)     return `${(freq / 1_000).toFixed(0)}k`;
    return `${freq}`;
  };

  return (
      <KronosCard className="p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
              <History className="size-3.5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Historial de Mediciones</h2>
              <p className="text-[10px] text-muted-foreground">
                {measurements.length} medición{measurements.length !== 1 ? 'es' : ''} guardada{measurements.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {selectedId !== null && (
              <KronosBadge variant="info" dot size="sm">
                Seleccionada
              </KronosBadge>
          )}
        </div>

        {/* Lista */}
        <div className="max-h-64 overflow-y-auto">
          {measurements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-5">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted/40 mb-3">
                  <History className="size-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No hay mediciones guardadas</p>
              </div>
          ) : (
              <div className="divide-y divide-border">
                {measurements.map((measurement) => {
                  const isSelected = selectedId === measurement.id;
                  return (
                      <div
                          key={measurement.id}
                          onClick={() => onSelectMeasurement(measurement.id)}
                          className={`flex items-start justify-between px-5 py-3 cursor-pointer transition-colors ${
                              isSelected
                                  ? 'bg-primary/10 border-l-2 border-primary'
                                  : 'hover:bg-muted/40 border-l-2 border-transparent'
                          }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="size-3 shrink-0" />
                            <span className={isSelected ? 'text-primary font-medium' : ''}>
                        {formatDate(measurement.takenAt)}
                      </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Cpu className="size-3 shrink-0" />
                            <span className="truncate">
                        {measurement.analyzerName}
                      </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground/70 font-mono">
                            {formatFreq(measurement.startFreq)} — {formatFreq(measurement.stopFreq)} Hz
                            {measurement.sweepType && (
                                <span className="ml-1.5 px-1 py-0.5 rounded bg-muted/50 text-[9px] uppercase">
                          {measurement.sweepType}
                        </span>
                            )}
                          </p>
                        </div>

                        {isSelected && (
                            <div className="shrink-0 ml-3 mt-0.5">
                              <div className="size-2 rounded-full bg-primary" />
                            </div>
                        )}
                      </div>
                  );
                })}
              </div>
          )}
        </div>
      </KronosCard>
  );
};

export default MeasurementHistory;