import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUpdateTaskChannel } from '../../hooks/useChannels';
import type { TaskChannelInfo } from '../../types/measurement.types';
import { KronosCard, KronosButton } from '../kronos';
import { X } from 'lucide-react';

interface ChannelConfigModalProps {
  taskId: number;
  channel: TaskChannelInfo | null;
  onClose: () => void;
}

interface FormData {
  alias: string;
  concreteMixPercent: string | number | null;
  hasEmulsifier: boolean;
  temperature: string | number | null;
  humidity: string | number | null;
  sampleAge: string | number | null;
  notes: string;
}

const ChannelConfigModal: React.FC<ChannelConfigModalProps> = ({
  taskId,
  channel,
  onClose,
}) => {
  const updateChannel = useUpdateTaskChannel(taskId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    if (channel) {
      reset({
        alias: channel.alias,
        concreteMixPercent: channel.concreteMix !== null ? channel.concreteMix * 100 : '',
        hasEmulsifier: channel.hasEmulsifier ?? false,
        temperature: channel.temperature ?? '',
        humidity: channel.humidity ?? '',
        sampleAge: channel.sampleAge ?? '',
        notes: channel.notes ?? '',
      });
    }
  }, [channel, reset]);

  const onSubmit = (data: FormData) => {
    if (!channel) return;

    const parseNum = (val: string | number | null) => {
      if (val === '' || val === null) return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    const concreteMixPercent = parseNum(data.concreteMixPercent);

    updateChannel.mutate(
      {
        channelNumber: channel.channelNumber,
        body: {
          alias: data.alias || `Canal ${channel.channelNumber}`,
          concreteMix: concreteMixPercent !== null ? concreteMixPercent / 100 : null,
          hasEmulsifier: data.hasEmulsifier,
          notes: data.notes || null,
          sampleAge: parseNum(data.sampleAge),
          temperature: parseNum(data.temperature),
          humidity: parseNum(data.humidity),
        },
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  if (!channel) return null;

  const inputClass = 'w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors';
  const isPending = updateChannel.isPending || isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        <KronosCard className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Canal {channel.channelNumber}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 break-words">{channel.alias}</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* SECCIÓN IDENTIFICACIÓN */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Identificación</h3>
            <div>
              <label className="block text-muted-foreground text-sm mb-1.5 font-medium">Alias / Nombre</label>
              <input type="text" maxLength={100} placeholder={`Canal ${channel.channelNumber}`} {...register('alias')} className={inputClass} />
            </div>
          </div>

          {/* SECCIÓN COMPOSICIÓN */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Composición de la muestra</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-muted-foreground text-sm mb-1.5 font-medium">% Mezcla de concreto</label>
                <div className="relative">
                  <input type="number" step="0.01" min="0" max="100" placeholder="Ej: 45" {...register('concreteMixPercent')} className={`${inputClass} pr-8`} />
                  <span className="absolute right-3 top-2 text-muted-foreground">%</span>
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <input type="checkbox" {...register('hasEmulsifier')} className="w-4 h-4 rounded border-border bg-muted/30 accent-primary focus:ring-primary" />
                <span className="text-muted-foreground text-sm font-medium">Tiene emulsionante</span>
              </label>
            </div>
          </div>

          {/* SECCIÓN CONDICIONES AMBIENTALES */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Condiciones ambientales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-muted-foreground text-sm mb-1.5 font-medium">Temperatura (°C)</label>
                <input type="number" step="0.1" placeholder="Ej: 20" {...register('temperature')} className={inputClass} />
              </div>
              <div>
                <label className="block text-muted-foreground text-sm mb-1.5 font-medium">Humedad (%)</label>
                <input type="number" min="0" max="100" placeholder="Ej: 65" {...register('humidity')} className={inputClass} />
              </div>
            </div>
          </div>

          {/* SECCIÓN MUESTRA */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Muestra</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-muted-foreground text-sm mb-1.5 font-medium">Edad de la muestra (días)</label>
                <input type="number" min="0" placeholder="Ej: 28" {...register('sampleAge')} className={inputClass} />
              </div>
              <div>
                <label className="block text-muted-foreground text-sm mb-1.5 font-medium">Notas</label>
                <textarea maxLength={500} rows={3} placeholder="Descripción de la muestra..." {...register('notes')} className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>

          </form>

          <div className="flex items-center justify-end gap-3">
            <KronosButton type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</KronosButton>
            <KronosButton type="button" size="sm" disabled={isPending} onClick={handleSubmit(onSubmit)}>{isPending ? 'Guardando...' : 'Guardar'}</KronosButton>
          </div>
        </KronosCard>
      </div>
    </div>
  );
};

export default ChannelConfigModal;
