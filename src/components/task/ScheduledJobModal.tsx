import { useState } from 'react';
import { useCreateScheduledJob } from '../../hooks/useTaskPreference';
import type { TaskChannelInfo } from '../../types/measurement.types';
import { Calendar, Clock, X, ChevronRight, ChevronLeft } from 'lucide-react';
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
  channels: number[];
}

const calculateEndTime = (startAt: Date, intervalMinutes: number | null, repeatCount: number): Date => {
  if (!intervalMinutes || repeatCount <= 1) return startAt;
  const totalMinutes = intervalMinutes * (repeatCount - 1);
  return new Date(startAt.getTime() + totalMinutes * 60000);
};

const ScheduledJobModal = ({
  isOpen,
  onClose,
  taskId,
  selectedChannels,
  taskChannels,
}: ScheduledJobModalProps) => {
  const createScheduledJob = useCreateScheduledJob();

  const [step, setStep] = useState<'schedule' | 'channels'>('schedule');
  const [formData, setFormData] = useState<FormData>({
    label: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    intervalMinutes: '',
    repeatCount: '1',
    channels: selectedChannels,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputClass = 'w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChannelChange = (channel: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: checked ? Array.from(new Set([...prev.channels, channel])) : prev.channels.filter(c => c !== channel),
    }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStep('channels');
  };

  const onConfirm = () => {
    const startAtIso = `${formData.startDate}T${formData.startTime}:00Z`;
    const intervalMinutes = formData.intervalMinutes ? parseInt(formData.intervalMinutes) : null;
    const repeatCount = Math.max(1, parseInt(formData.repeatCount) || 1);

    if (formData.channels.length === 0) {
      setErrorMsg('Selecciona al menos un canal');
      return;
    }

    createScheduledJob.mutate(
      {
        taskId,
        label: formData.label || null,
        startAt: startAtIso,
        intervalMinutes,
        repeatCount,
        channelNumbers: formData.channels,
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
            channels: selectedChannels,
          });
        },
      }
    );
  };

  // Calcular preview
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
              <div className="flex items-center gap-2 mb-0.5">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${step === 'schedule' ? 'bg-primary' : 'bg-primary/40'}`} />
                  <div className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${step === 'channels' ? 'bg-primary' : 'bg-muted'}`} />
                </div>
                <span className="text-[10px] text-muted-foreground mb-3 block">{step === 'schedule' ? 'Paso 1 de 2' : 'Paso 2 de 2'}</span>
              </div>
              <h2 className="text-sm font-semibold text-foreground">{step === 'schedule' ? 'Programación' : 'Selecciona los canales'}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{step === 'schedule' ? 'Programa cuándo y con qué frecuencia ejecutar la medición' : 'Subset de los canales configurados en esta tarea'}</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="size-4" />
            </button>
          </div>

          {/* Step 1 */}
          {step === 'schedule' && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Etiqueta (opcional)</label>
                <input type="text" placeholder="Ej: Monitoreo nocturno..." value={formData.label} onChange={e => handleInputChange('label', e.target.value)} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <input type="date" value={formData.startDate} onChange={e => handleInputChange('startDate', e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hora</label>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <input type="time" value={formData.startTime} onChange={e => handleInputChange('startTime', e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Intervalo (min) — opcional</label>
                  <input type="number" min={1} placeholder="Vacío = una sola vez" value={formData.intervalMinutes} onChange={e => handleInputChange('intervalMinutes', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Repeticiones (mín 1)</label>
                  <input type="number" min={1} max={100} value={formData.repeatCount} onChange={e => handleInputChange('repeatCount', e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="bg-muted/30 rounded-md px-3 py-2 text-xs text-muted-foreground">{previewText}</div>

              <div className="flex justify-end gap-2 pt-1">
                <KronosButton type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</KronosButton>
                <KronosButton type="submit" size="sm" rightIcon={<ChevronRight className="size-3.5" />}>Siguiente</KronosButton>
              </div>
            </form>
          )}

          {/* Step 2 */}
          {step === 'channels' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 16 }, (_, i) => {
                  const channelNumber = i + 1;
                  const channel = taskChannels.find(c => c.channelNumber === channelNumber);
                  const alias = channel?.alias ?? `Canal ${channelNumber}`;
                  const selected = formData.channels.includes(channelNumber);

                  return (
                    <button
                      key={channelNumber}
                      type="button"
                      onClick={() => handleChannelChange(channelNumber, !selected)}
                      className={`flex flex-col items-center justify-center gap-0.5 rounded-md border px-2 py-2.5 min-h-[56px] w-full transition-colors duration-150 ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <span className={`text-[10px] font-mono leading-none ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {String(channelNumber).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] font-medium truncate w-full text-center leading-tight text-muted-foreground/60">
                        {alias}
                      </span>
                    </button>
                  );
                })}
              </div>

              {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

              <div className="flex items-center justify-between pt-1">
                <KronosButton type="button" variant="ghost" size="sm" className="text-muted-foreground" leftIcon={<ChevronLeft className="size-3.5" />} onClick={() => setStep('schedule')}>Atrás</KronosButton>
                <div className="flex gap-2">
                  <KronosButton type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</KronosButton>
                  <KronosButton type="button" size="sm" disabled={createScheduledJob.isPending || formData.channels.length === 0} onClick={onConfirm}>{createScheduledJob.isPending ? 'Programando...' : 'Programar'}</KronosButton>
                </div>
              </div>
            </div>
          )}

        </KronosCard>
      </div>
    </div>
  );
};

export default ScheduledJobModal;


