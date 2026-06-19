import { useState } from 'react';
import { useGetTaskPreference, useTestConnection } from '../../hooks/useTaskPreference';
import TaskPreferenceModal from './TaskPreferenceModal';

interface DeviceConnectionCardProps {
  taskId: number;
  projectId: string;
}

const DeviceConnectionCard = ({ taskId, projectId }: DeviceConnectionCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: preference } = useGetTaskPreference(taskId);
  const testAnalyzer = useTestConnection();
  const testMux = useTestConnection();

  const handleTestConnection = (deviceType: 'analyzer' | 'mux', ip: string | null) => {
    if (!ip) return;
    if (deviceType === 'analyzer') {
      testAnalyzer.mutate({ type: 'analyzer', ip, port: 3570 });
    } else {
      testMux.mutate({ type: 'mux', ip, port: 3570 });
    }
  };

  const getConnectionStatus = (isPending: boolean, isSuccess: boolean, isError: boolean) => {
    if (isPending) return { text: '🟡 Probando...', color: 'text-yellow-400', disabled: true };
    if (isSuccess) return { text: '🟢 Conectado', color: 'text-green-400', disabled: false };
    if (isError) return { text: '🔴 Sin conexión', color: 'text-red-400', disabled: false };
    return { text: 'Probar Conexión', color: 'text-slate-400', disabled: false };
  };

  // Caso 1: Sin preference configurada
    if (!preference || !preference.analyzerDevice || !preference.muxDevice) {

        return (
      <>
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-8 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors font-medium"
            >
              + Añadir Analizador
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-8 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors font-medium"
            >
              + Añadir MUX
            </button>
          </div>
        </div>
        {isModalOpen && <TaskPreferenceModal taskId={taskId} projectId={projectId} preference={null} onClose={() => setIsModalOpen(false)} />}
      </>
    );
  }

  // Caso 2: Con preference configurada
  const analyzerStatus = getConnectionStatus(testAnalyzer.isPending, testAnalyzer.isSuccess, testAnalyzer.isError);
  const muxStatus = getConnectionStatus(testMux.isPending, testMux.isSuccess, testMux.isError);

  return (
    <>
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* ANALIZADOR */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">Analizador</h3>
            <div className="space-y-2 mb-4">
              <div>
                <p className="text-sm text-slate-400">Nombre</p>
                <p className="text-white font-medium">{preference.analyzerDevice.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">IP</p>
                <p className="text-white font-medium font-mono">{preference.analyzerDevice.ip || 'Sin IP'}</p>
              </div>
            </div>

            <button
              onClick={() => handleTestConnection('analyzer', preference.analyzerDevice.ip)}
              disabled={analyzerStatus.disabled}
              className={`w-full px-3 py-2 rounded-md text-white font-medium mb-2 text-sm ${
                analyzerStatus.disabled ? 'bg-slate-600 cursor-not-allowed' : 'bg-slate-600 hover:bg-slate-500'
              }`}
            >
              {testAnalyzer.isPending ? '🟡 Probando...' : 'Probar Conexión'}
            </button>

            <div className={`text-sm text-center ${analyzerStatus.color}`}>
              {analyzerStatus.text}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-3 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md font-medium text-sm"
            >
              Cambiar
            </button>
          </div>

          {/* MUX */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">MUX</h3>
            <div className="space-y-2 mb-4">
              <div>
                <p className="text-sm text-slate-400">Nombre</p>
                <p className="text-white font-medium">{preference.muxDevice.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">IP</p>
                <p className="text-white font-medium font-mono">{preference.muxDevice.ip || 'Sin IP'}</p>
              </div>
            </div>

            <button
              onClick={() => handleTestConnection('mux', preference.muxDevice.ip)}
              disabled={muxStatus.disabled}
              className={`w-full px-3 py-2 rounded-md text-white font-medium mb-2 text-sm ${
                muxStatus.disabled ? 'bg-slate-600 cursor-not-allowed' : 'bg-slate-600 hover:bg-slate-500'
              }`}
            >
              {testMux.isPending ? '🟡 Probando...' : 'Probar Conexión'}
            </button>

            <div className={`text-sm text-center ${muxStatus.color}`}>
              {muxStatus.text}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-3 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md font-medium text-sm"
            >
              Cambiar
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && <TaskPreferenceModal taskId={taskId} projectId={projectId} preference={preference} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default DeviceConnectionCard;
