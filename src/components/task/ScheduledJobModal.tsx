import { useState } from 'react';
import { useCreateScheduledJob } from '../../hooks/useTaskPreference';
import type { TaskChannelInfo } from '../../types/measurement.types';
import { Calendar, Clock, X } from 'lucide-react';
import { KronosCard, KronosButton } from '../../components/kronos';

interface ScheduledJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  selectedChannels: number[];
  taskChannels: TaskChannelInfo[];
}

interface FormData {
  label: string;
  startDate: string;
  startTime: string;
  intervalMinutes: string;
  repeatCount: string;
}

const calculateEndTime = (startAt: Date, intervalMinutes: number | null, repeatCount: number): Date => {
  if (!intervalMinutes || repeatCount <= 1) return startAt;
  return new Date(startAt.getTime() + intervalMinutes * (repeatCount - 1) * 60000);
};

const ScheduledJobModal = ({
  isOpen,
  onClose,
  taskId,
  selectedChannels,
  taskChannels,
}: ScheduledJobModalProps) => {
  const createScheduledJob = useCreateScheduledJob();

  const [formData, setFormData] = useState<FormData>({
    label: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    intervalMinutes: '',
    repeatCount: '1',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputClass =
    'w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground ' +
    'placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedChannels.length === 0) {
      setErrorMsg('No hay canales seleccionados. Selecciona al menos uno en el panel principal.');
      return;
    }

    const startAtIso = `${formData.startDate}T${formData.startTime}:00Z`;
    const intervalMinutes = formData.intervalMinutes ? parseInt(formData.intervalMinutes) : null;
    const repeatCount = Math.max(1, parseInt(formData.repeatCount) || 1);

    createScheduledJob.mutate(
      {
        taskId,
        label: formData.label || null,
        startAt: startAtIso,
        intervalMinutes,
        repeatCount,
        channelNumbers: selectedChannels,
      },
      {
        onSuccess: () => {
          onClose();
          setFormData({
            label: '',
            startDate: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            intervalMinutes: '',
            repeatCount: '1',
          });
        },
      }
    );
  };

  const startAt = new Date(`${formData.startDate}T${formData.startTime}:00Z`);
  const intervalMinutes = formData.intervalMinutes ? parseInt(formData.intervalMinutes) : null;
  const repeatCount = Math.max(1, parseInt(formData.repeatCount) || 1);
  const endAt = calculateEndTime(startAt, intervalMinutes, repeatCount);

  const previewText =
    !intervalMinutes || repeatCount === 1
      ? `1 medición el ${startAt.toLocaleDateString('es-ES')} a las ${startAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
      : `${repeatCount} mediciones · cada ${intervalMinutes} min · inicio ${startAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · fin estimado ${endAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <KronosCard className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Programar medición</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configura cuándo y con qué frecuencia ejecutar la medición
              </p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Etiqueta (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Monitoreo nocturno..."
                value={formData.label}
                onChange={e => handleInputChange('label', e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha</label>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => handleInputChange('startDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hora</label>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={e => handleInputChange('startTime', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Intervalo (min) — opcional
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="Vacío = una sola vez"
                  value={formData.intervalMinutes}
                  onChange={e => handleInputChange('intervalMinutes', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Repeticiones (mín 1)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={formData.repeatCount}
                  onChange={e => handleInputChange('repeatCount', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Resumen de horario */}
            <div className="bg-muted/30 rounded-md px-3 py-2 text-xs text-muted-foreground">
              {previewText}
            </div>

            {/* Canales seleccionados (read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Canales ({selectedChannels.length})
              </label>
              {selectedChannels.length === 0 ? (
                <p className="text-xs text-destructive">
                  No hay canales seleccionados. Ve al panel principal y selecciona al menos uno.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedChannels.map(ch => {
                    const info = taskChannels.find(c => c.channelNumber === ch);
                    const label = info?.alias ?? `Canal ${ch}`;
                    return (
                      <span
                        key={ch}
                        className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary"
                      >
                        <span className="font-mono">{String(ch).padStart(2, '0')}</span>
                        <span className="text-primary/70">{label}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <KronosButton type="button" variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </KronosButton>
              <KronosButton
                type="submit"
                size="sm"
                disabled={createScheduledJob.isPending || selectedChannels.length === 0}
              >
                {createScheduledJob.isPending ? 'Programando...' : 'Programar'}
              </KronosButton>
            </div>
          </form>

        </KronosCard>
      </div>
    </div>
  );
};

export default ScheduledJobModal;
