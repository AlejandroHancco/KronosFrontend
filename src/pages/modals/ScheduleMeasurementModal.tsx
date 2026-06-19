import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '../../api/client';
import { KronosCard, KronosButton } from '../../components/kronos';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  taskId: number;
  taskChannels: { channelNumber: number; alias: string }[];
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'schedule' | 'channels';

interface ScheduleForm {
  label: string;
  startAt: string; // datetime-local
  intervalMinutes?: number | null;
  repeatCount: number;
}

const inputClass = 'w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

const calculateEndTime = (start: Date, intervalMinutes: number | null, repeatCount: number) => {
  if (!intervalMinutes || repeatCount <= 1) return start;
  const total = intervalMinutes * (repeatCount - 1);
  return new Date(start.getTime() + total * 60000);
};

const ScheduleMeasurementModal = ({ taskId, taskChannels, onClose, onSuccess }: Props) => {
  const [step, setStep] = useState<Step>('schedule');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ScheduleForm>({
    defaultValues: {
      label: '',
      startAt: new Date().toISOString().slice(0,16), // YYYY-MM-DDTHH:mm
      intervalMinutes: undefined,
      repeatCount: 1,
    }
  });

  const watchedStartAt = watch('startAt');
  const watchedInterval = watch('intervalMinutes');
  const watchedRepeat = watch('repeatCount');

  const preview = useMemo(() => {
    if (!watchedStartAt) return '';
    const start = new Date(watchedStartAt);
    const interval = watchedInterval ?? null;
    const repeat = Math.max(1, Number(watchedRepeat) || 1);
    const end = calculateEndTime(start, interval, repeat);

    if (!interval || repeat === 1) {
      return `1 medición el ${start.toLocaleDateString('es-ES')} a las ${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${repeat} mediciones · cada ${interval} min · inicio ${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · fin estimado ${end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  }, [watchedStartAt, watchedInterval, watchedRepeat]);

  // channels state
  const initialChannels = useMemo(() => taskChannels.map(c => c.channelNumber), [taskChannels]);
  const [selectedChannels, setSelectedChannels] = useState<number[]>(initialChannels);

  const toggleChannel = (n: number) => {
    setSelectedChannels(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  };

  const onSubmitSchedule = () => {
    // validate preview handled by react-hook-form rules
    setErrorMsg(null);
    setStep('channels');
  };

  const onConfirm = async () => {
    if (selectedChannels.length === 0) {
      setErrorMsg('Selecciona al menos un canal');
      return;
    }

    // read current form values via watch
    const label = watch('label') || '';
    const startAtRaw = watch('startAt');
    const intervalRaw = watch('intervalMinutes');
    const repeatRaw = watch('repeatCount') || 1;

    const payload = {
      label: label === '' ? null : label,
      startAt: new Date(startAtRaw).toISOString(),
      intervalMinutes: intervalRaw === undefined || intervalRaw === null ? null : Number(intervalRaw),
      repeatCount: Number(repeatRaw),
      channelNumbers: selectedChannels,
    } as const;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await apiClient.post(`/tasks/${taskId}/scheduled-jobs`, payload);
      onSuccess?.();
      onClose();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <span className="text-[10px] text-muted-foreground mb-3 block">
                  {step === 'schedule' ? 'Paso 1 de 2' : 'Paso 2 de 2'}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-foreground">{step === 'schedule' ? 'Programación' : 'Selecciona los canales a medir'}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{step === 'schedule' ? 'Programa cuándo y con qué frecuencia ejecutar la medición' : 'Subset de los canales configurados en esta tarea'}</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="size-4" />
            </button>
          </div>

          {/* Step 1 */}
          {step === 'schedule' && (
            <form onSubmit={handleSubmit(onSubmitSchedule)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Etiqueta (opcional)</label>
                <input {...register('label')} placeholder="Ej: Monitoreo nocturno..." className={inputClass} />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha y hora de inicio</label>
                  <input
                    {...register('startAt', { required: 'La fecha y hora son requeridas' })}
                    type="datetime-local"
                    className={inputClass}
                  />
                  {errors.startAt && <p className="text-xs text-destructive">{errors.startAt.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Intervalo (min) — opcional</label>
                    <input {...register('intervalMinutes', { valueAsNumber: true, min: 1 })} type="number" min={1} placeholder="Vacío = una sola vez" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Repeticiones (mín 1)</label>
                    <input {...register('repeatCount', { valueAsNumber: true, required: true, min: 1, max: 100 })} type="number" min={1} max={100} defaultValue={1} className={inputClass} />
                    {errors.repeatCount && <p className="text-xs text-destructive">{errors.repeatCount.message}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-md px-3 py-2 text-xs text-muted-foreground">
                {preview}
              </div>

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
                {taskChannels.map((c) => (
                  <label key={c.channelNumber} className="flex flex-col items-start gap-1 p-3 bg-muted/20 rounded-md cursor-pointer hover:bg-muted/30">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedChannels.includes(c.channelNumber)} onChange={() => toggleChannel(c.channelNumber)} className="rounded border-border text-blue-500 focus:ring-blue-500" />
                    </div>
                    <div className="text-xl font-bold text-foreground">{c.channelNumber}</div>
                    <div className="text-xs text-muted-foreground">{c.alias}</div>
                  </label>
                ))}
              </div>

              {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

              <div className="flex items-center justify-between pt-1">
                <KronosButton type="button" variant="ghost" size="sm" className="text-muted-foreground" leftIcon={<ChevronLeft className="size-3.5" />} onClick={() => setStep('schedule')}>Atrás</KronosButton>
                <div className="flex gap-2">
                  <KronosButton type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</KronosButton>
                  <KronosButton type="button" size="sm" disabled={isSubmitting} onClick={onConfirm}>{isSubmitting ? 'Programando...' : 'Programar'}</KronosButton>
                </div>
              </div>
            </div>
          )}

        </KronosCard>
      </div>
    </div>
  );
};

export default ScheduleMeasurementModal;


