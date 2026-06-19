import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCreateTask, useGetProjectDevices } from '../../hooks/useTasks';
import { createTaskPreference } from '../../api/tasks.api';
import type { CreateTaskPreferenceDto } from '../../types/measurement.types';
import {
  KronosCard,
  KronosButton,
} from '../../components/kronos';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import type { CreateTaskDto } from "../../types/task.types";

interface CreateTaskFormData extends CreateTaskDto {
  preferenceName: string;
  analyzerDeviceId: string;
  muxDeviceId: string;
  startFreq: number;
  stopFreq: number;
  points: number;
  sweepType: 'LOG' | 'LIN';
}

type Step = 'info' | 'preference';

interface Props {
  projectId: string;
  onClose: () => void;
  onSuccess?: (taskId: number) => void;
}

const CreateTaskModal = ({ projectId, onClose, onSuccess }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('info');
  const [isCreatingPreference, setIsCreatingPreference] = useState(false);
  const [preferenceError, setPreferenceError] = useState<string | null>(null);
  const [createdTaskId, setCreatedTaskId] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<CreateTaskFormData>({
    defaultValues: {
      name: '',
      description: '',
      preferenceName: '',
      analyzerDeviceId: '',
      muxDeviceId: '',
      startFreq: 50000,
      stopFreq: 500000,
      points: 801,
      sweepType: 'LOG',
    },
  });

  const createTaskMutation = useCreateTask(projectId);
  const { data: devices = [] } = useGetProjectDevices(projectId);
  const analyzerDevices = devices.filter((d) => d.type === 'analyzer');
  const muxDevices = devices.filter((d) => d.type === 'mux');
  const hasDevices = analyzerDevices.length > 0 && muxDevices.length > 0;

  // Paso 1 → crear tarea y pasar al paso 2
  const handleNextStep = handleSubmit(async (data) => {
    if (step === 'info') {
      try {
        const task = await createTaskMutation.mutateAsync({
          name: data.name,
          description: data.description,
        });
        setCreatedTaskId(task.id);
        setStep('preference');
      } catch  {
        }
    }
  });

  // Paso 2 → guardar preferencia y cerrar
  const handleSavePreference = async () => {
    const data = getValues();
    if (!createdTaskId) return;
    try {
      setPreferenceError(null);
      setIsCreatingPreference(true);
      const payload: CreateTaskPreferenceDto = {
        name: data.preferenceName,
        analyzerDeviceId: data.analyzerDeviceId,
        muxDeviceId: data.muxDeviceId,
        startFreq: data.startFreq,
        stopFreq: data.stopFreq,
        points: data.points ?? 801,
        sweepType: data.sweepType ?? 'LOG',
      };
      await createTaskPreference(createdTaskId, payload);
      onSuccess?.(createdTaskId);
      navigate(`/projects/${projectId}/tasks/${createdTaskId}`);
      onClose();
    } catch (e) {
      setPreferenceError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setIsCreatingPreference(false);
    }
  };

  // Omitir preferencia
  const handleSkip = () => {
    if (createdTaskId) {
      onSuccess?.(createdTaskId);
      navigate(`/projects/${projectId}/tasks/${createdTaskId}`);
    }
    onClose();
  };

  const isPending = createTaskMutation.isPending || isCreatingPreference;

  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
      >
        <div
            className="w-full max-w-lg"
            onClick={e => e.stopPropagation()}
        >
          <KronosCard className="p-6 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  {/* Stepper */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${step === 'info' ? 'bg-primary' : 'bg-primary/40'}`} />
                    <div className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${step === 'preference' ? 'bg-primary' : 'bg-muted'}`} />
                  </div>
                  <span className="text-[10px] text-muted-foreground mb-3 block">
    {step === 'info' ? 'Paso 1 de 2' : 'Paso 2 de 2'}
</span>
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  {step === 'info' ? 'Nueva Tarea' : 'Configuración de Medida'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step === 'info'
                      ? 'Ingresa el nombre y descripción de la tarea'
                      : 'Configura el preset de sweep o puedes omitir este paso'}
                </p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {/* ── STEP 1: Info ── */}
            {step === 'info' && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Nombre <span className="text-destructive">*</span>
                    </label>
                    <input
                        {...register('name', { required: 'El nombre es requerido' })}
                        placeholder="Nombre de la tarea..."
                        className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Descripción
                    </label>
                    <textarea
                        {...register('description')}
                        placeholder="Descripción opcional..."
                        rows={3}
                        className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none"
                    />
                  </div>

                  {createTaskMutation.isError && (
                      <p className="text-xs text-destructive">Error al crear la tarea. Intenta de nuevo.</p>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <KronosButton type="button" variant="outline" size="sm" onClick={onClose}>
                      Cancelar
                    </KronosButton>
                    <KronosButton
                        type="submit"
                        size="sm"
                        disabled={isPending}
                        rightIcon={<ChevronRight className="size-3.5" />}
                    >
                      {isPending ? 'Creando...' : 'Siguiente'}
                    </KronosButton>
                  </div>
                </form>
            )}

            {/* ── STEP 2: Preference ── */}
            {step === 'preference' && (
                <div className="space-y-4">
                  {!hasDevices && (
                      <div className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2.5">
                        <p className="text-xs text-warning">
                          ⚠️ No hay dispositivos en este proyecto. Puedes omitir este paso y configurarlo después.
                        </p>
                      </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Nombre del Preset <span className="text-destructive">*</span>
                    </label>
                    <input
                        {...register('preferenceName')}
                        placeholder="Ej: Config estándar"
                        className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Analizador</label>
                      <select
                          {...register('analyzerDeviceId')}
                          disabled={!hasDevices}
                          className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                      >
                        <option value="">Selecciona...</option>
                        {analyzerDevices.map((d) => (
                            <option key={d.id} value={d.id}>{d.name} — {d.ip || 'sin IP'}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">MUX</label>
                      <select
                          {...register('muxDeviceId')}
                          disabled={!hasDevices}
                          className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                      >
                        <option value="">Selecciona...</option>
                        {muxDevices.map((d) => (
                            <option key={d.id} value={d.id}>{d.name} — {d.ip || 'sin IP'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Freq (Hz)</label>
                      <input
                          type="number"
                          {...register('startFreq', { valueAsNumber: true })}
                          className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stop Freq (Hz)</label>
                      <input
                          type="number"
                          {...register('stopFreq', { valueAsNumber: true })}
                          className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Points</label>
                      <input
                          type="number"
                          {...register('points', { valueAsNumber: true, min: 1, max: 801 })}
                          className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sweep Type</label>
                      <select
                          {...register('sweepType')}
                          className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                      >
                        <option value="LOG">LOG</option>
                        <option value="LIN">LIN</option>
                      </select>
                    </div>
                  </div>

                  {preferenceError && (
                      <p className="text-xs text-destructive">
                        ⚠️ La tarea fue creada pero hubo un error al guardar las preferencias. Puedes configurarlas después.
                      </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <KronosButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        leftIcon={<ChevronLeft className="size-3.5" />}
                        onClick={() => setStep('info')}
                    >
                      Atrás
                    </KronosButton>

                    <div className="flex gap-2">
                      <KronosButton
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSkip}
                      >
                        Omitir
                      </KronosButton>
                      <KronosButton
                          type="button"
                          size="sm"
                          disabled={isPending || !hasDevices}
                          onClick={handleSavePreference}
                      >
                        {isPending ? 'Guardando...' : 'Guardar y continuar'}
                      </KronosButton>
                    </div>
                  </div>
                </div>
            )}
          </KronosCard>
        </div>
      </div>
  );
};

export default CreateTaskModal;