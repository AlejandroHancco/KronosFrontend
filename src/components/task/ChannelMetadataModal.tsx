import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUpdateMeasurementChannel, useGetMeasurementChannels } from '../../hooks/useChannels';

interface ChannelMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  measurementId: number;
  channelNumber: number;
  channelAlias: string | null;
}

interface FormData {
  concreteMix: number;
  hasEmulsifier: boolean;
  notes: string;
  sampleAge: number;
  temperature: number;
  humidity: number;
}

const ChannelMetadataModal: React.FC<ChannelMetadataModalProps> = ({
  isOpen,
  onClose,
  measurementId,
  channelNumber,
  channelAlias,
}) => {
  const { data: channels } = useGetMeasurementChannels(measurementId);
  const updateChannel = useUpdateMeasurementChannel();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const channelData = channels?.find(c => c.channelNumber === channelNumber);

  useEffect(() => {
    if (channelData) {
      reset({
        concreteMix: channelData.concreteMix || 0,
        hasEmulsifier: channelData.hasEmulsifier || false,
        notes: channelData.notes || '',
        sampleAge: channelData.sampleAge || 0,
        temperature: channelData.temperature || 0,
        humidity: channelData.humidity || 0,
      });
    }
  }, [channelData, reset]);

  const onSubmit = (data: FormData) => {
    updateChannel.mutate(
      {
        measurementId,
        channelNumber,
        data: {
          concreteMix: data.concreteMix / 100, // Convertir % a decimal
          hasEmulsifier: data.hasEmulsifier,
          notes: data.notes,
          sampleAge: data.sampleAge,
          temperature: data.temperature,
          humidity: data.humidity,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-white text-lg font-semibold mb-4">
          Canal {channelNumber} — {channelAlias || `Canal ${channelNumber}`}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              % Mezcla Concreto
            </label>
            <input
              type="number"
              min="0"
              max="100"
              {...register('concreteMix', { required: true, min: 0, max: 100 })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
            {errors.concreteMix && <p className="text-red-400 text-sm">Requerido, 0-100%</p>}
          </div>

          <div>
            <label className="flex items-center text-slate-300 text-sm mb-1">
              <input
                type="checkbox"
                {...register('hasEmulsifier')}
                className="mr-2 accent-amber-500"
              />
              Tiene Emulsionante
            </label>
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Notas
            </label>
            <textarea
              {...register('notes')}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Edad de la muestra (días)
            </label>
            <input
              type="number"
              min="0"
              {...register('sampleAge', { required: true, min: 0 })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
            {errors.sampleAge && <p className="text-red-400 text-sm">Requerido, mínimo 0</p>}
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Temperatura (°C)
            </label>
            <input
              type="number"
              step="0.1"
              {...register('temperature', { required: true })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
            {errors.temperature && <p className="text-red-400 text-sm">Requerido</p>}
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Humedad (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              {...register('humidity', { required: true, min: 0, max: 100 })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
            {errors.humidity && <p className="text-red-400 text-sm">Requerido, 0-100%</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateChannel.isPending}
              className="px-4 py-2 bg-amber-500 text-black rounded-md hover:bg-amber-400 disabled:opacity-50"
            >
              {updateChannel.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Guardando...
                </div>
              ) : (
                'Guardar metadata'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChannelMetadataModal;

