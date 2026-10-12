import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateTaskPreference, useUpdateTaskPreference } from '../../hooks/useTaskPreference';
import { useGetProjectDevices } from '../../hooks/useDevices';
import type { TaskPreferenceResponse } from '../../types/measurement.types';

interface TaskPreferenceModalProps {
  taskId: number;
  projectId: string;
  preference: TaskPreferenceResponse | null;
  onClose: () => void;
}

interface FormData {
  name: string;
  startFreq: number;
  stopFreq: number;
  points: number;
  sweepType: string;
  analyzerDeviceId: string;
  muxDeviceId: string;
}

const TaskPreferenceModal = ({ taskId, projectId, preference, onClose }: TaskPreferenceModalProps) => {
  const { data: devices = [] } = useGetProjectDevices(projectId);
  const createPreference = useCreateTaskPreference(taskId);
  const updatePreference = useUpdateTaskPreference(taskId);

  const firstRange = preference?.ranges?.[0];

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      name: preference?.name || '',
      startFreq: firstRange?.startFreq || 1000,
      stopFreq: firstRange?.stopFreq || 100000,
      points: firstRange?.points || 801,
      sweepType: firstRange?.sweepType || 'LOG',
      analyzerDeviceId: preference?.analyzerDevice?.id || '',
      muxDeviceId: preference?.muxDevice?.id || '',
    },
  });

  const analyzerDevices = devices.filter((d) => d.type === 'analyzer');
  const muxDevices = devices.filter((d) => d.type === 'mux');

  useEffect(() => {
    if (preference) {
      const range = preference.ranges?.[0];
      reset({
        name: preference.name,
        startFreq: range?.startFreq ?? 1000,
        stopFreq: range?.stopFreq ?? 100000,
        points: range?.points ?? 801,
        sweepType: range?.sweepType ?? 'LOG',
        analyzerDeviceId: preference.analyzerDevice.id,
        muxDeviceId: preference.muxDevice.id,
      });
    }
  }, [preference, reset]);

  const onSubmit = (data: FormData) => {
    const ranges = [{
      order: 1,
      startFreq: data.startFreq,
      stopFreq: data.stopFreq,
      points: data.points,
      sweepType: data.sweepType,
    }];

    if (preference) {
      // Update
      updatePreference.mutate(
        {
          name: data.name,
          analyzerDeviceId: data.analyzerDeviceId,
          muxDeviceId: data.muxDeviceId,
          ranges,
        },
        {
          onSuccess: onClose,
        }
      );
    } else {
      // Create
      createPreference.mutate(
        {
          name: data.name,
          analyzerDeviceId: data.analyzerDeviceId,
          muxDeviceId: data.muxDeviceId,
          ranges,
        },
        {
          onSuccess: onClose,
        }
      );
    }
  };

  const isPending = createPreference.isPending || updatePreference.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white">
            {preference ? 'Editar Preferencia' : 'Nueva Preferencia'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* SECCIÓN CONFIGURACIÓN */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Configuración</h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre del Preset</label>
              <input
                {...register('name', { required: true })}
                type="text"
                placeholder="Ej: Config estándar"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Start Freq (Hz)</label>
                <input
                  {...register('startFreq', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Stop Freq (Hz)</label>
                <input
                  {...register('stopFreq', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Points</label>
                <input
                  {...register('points', { valueAsNumber: true, min: 1, max: 801 })}
                  type="number"
                  min="1"
                  max="801"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Sweep Type</label>
                <select
                  {...register('sweepType')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="LOG">LOG</option>
                  <option value="LIN">LIN</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN DISPOSITIVOS */}
          <div className="space-y-2 border-t border-slate-700 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dispositivos</h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Analizador</label>
              <select
                {...register('analyzerDeviceId', { required: true })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="">Selecciona un analizador</option>
                {analyzerDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} — {device.ip || 'sin IP'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">MUX</label>
              <select
                {...register('muxDeviceId', { required: true })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="">Selecciona un MUX</option>
                {muxDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} — {device.ip || 'sin IP'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-2 border-t border-slate-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`flex-1 px-4 py-2 rounded-md font-medium text-white ${
                isPending ? 'bg-slate-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
              }`}
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskPreferenceModal;





