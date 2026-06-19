import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateDevice, useUpdateDevice } from '../hooks/useDevices';
import type {DeviceResponse} from "../types/device.types.ts";

interface DeviceFormModalProps {
  projectId: string;
  device: DeviceResponse | null;  // null = crear
  defaultType: 'analyzer' | 'mux';
  onClose: () => void;
}

interface FormData {
  name: string;
  type: 'analyzer' | 'mux';
  ip: string;
}

const DeviceFormModal = ({ projectId, device, defaultType, onClose }: DeviceFormModalProps) => {
  const createDevice = useCreateDevice(projectId);
  const updateDevice = useUpdateDevice(projectId);

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      name: device?.name || '',
      type: device?.type as 'analyzer' | 'mux' || defaultType,
      ip: device?.ip || '',
    },
  });

  useEffect(() => {
    if (device) {
      reset({
        name: device.name,
        type: device.type as 'analyzer' | 'mux',
        ip: device.ip || '',
      });
    }
  }, [device, reset]);

  const onSubmit = (data: FormData) => {
    if (device) {
      // Update
      updateDevice.mutate(
        { id: device.id, data },
        {
          onSuccess: onClose,
        }
      );
    } else {
      // Create
      createDevice.mutate(
        data,
        {
          onSuccess: onClose,
        }
      );
    }
  };

  const isPending = createDevice.isPending || updateDevice.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {device ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre *</label>
              <input
                {...register('name', { required: true })}
                type="text"
                placeholder="Ej: Hioki IM3570"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
              <select
                {...register('type')}
                disabled={!!device} // Deshabilitado si editando
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-50"
              >
                <option value="analyzer">Analizador</option>
                <option value="mux">MUX</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">IP</label>
              <input
                {...register('ip')}
                type="text"
                placeholder="Ej: 192.168.1.222"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="flex gap-2">
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
    </div>
  );
};

export default DeviceFormModal;
