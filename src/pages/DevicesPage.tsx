import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetProjectDevices,
  useDeleteDevice,
  useTestDeviceConnection,
} from '../hooks/useDevices';
import DeviceFormModal from '../components/DeviceFormModal';
import type { DeviceResponse } from '../types/device.types';
import {
  KronosLayout,
  KronosPageHeader,
  KronosCard,
  KronosBadge,
  KronosButton,
  KronosSection,
} from '../components/kronos';
import { ArrowLeft, Cpu, Layers, Plus, Pencil, Trash2, Wifi } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────

type TestState = 'idle' | 'testing' | 'success' | 'error';

const testBadge: Record<TestState, { variant: 'default' | 'warning' | 'success' | 'danger'; label: string }> = {
  idle:    { variant: 'default',  label: 'Probar'       },
  testing: { variant: 'warning',  label: 'Probando...'  },
  success: { variant: 'success',  label: 'Conectado'    },
  error:   { variant: 'danger',   label: 'Sin conexión' },
};

// ── Device card ────────────────────────────────────────────────────────────────

const DeviceRow = ({
                     device,
                     testState,
                     onTest,
                     onEdit,
                     onDelete,
                   }: {
  device: DeviceResponse;
  testState: TestState;
  onTest: (d: DeviceResponse) => void;
  onEdit: (d: DeviceResponse) => void;
  onDelete: (d: DeviceResponse) => void;
}) => {
  const badge = testBadge[testState];

  return (
      <KronosCard className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{device.name}</p>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            {device.ip ?? 'Sin IP asignada'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Test connection */}
          <KronosButton
              variant="outline"
              size="sm"
              leftIcon={<Wifi className="size-3.5" />}
              disabled={!device.ip || testState === 'testing'}
              onClick={() => onTest(device)}
          >
            <KronosBadge variant={badge.variant} size="sm">{badge.label}</KronosBadge>
          </KronosButton>

          {/* Edit */}
          <KronosButton
              variant="ghost"
              size="sm"
              leftIcon={<Pencil className="size-3.5" />}
              onClick={() => onEdit(device)}
          >
            Editar
          </KronosButton>

          {/* Delete */}
          <KronosButton
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="size-3.5 text-destructive" />}
              onClick={() => onDelete(device)}
              className="text-destructive hover:text-destructive"
          >
            Eliminar
          </KronosButton>
        </div>
      </KronosCard>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────

const DevicesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [selectedDevice, setSelectedDevice] = useState<DeviceResponse | null>(null);
  const [modalType, setModalType] = useState<'analyzer' | 'mux'>('analyzer');
  const [showModal, setShowModal] = useState(false);

  // testingDeviceId: qué device está siendo testeado ahora mismo
  const [testingDeviceId, setTestingDeviceId] = useState<string | null>(null);
  // lastTestedId + result: para mostrar el resultado post-test
  const [lastResult, setLastResult] = useState<{ id: string; success: boolean } | null>(null);

  const { data: devices = [], isLoading } = useGetProjectDevices(projectId);
  const deleteDevice   = useDeleteDevice(projectId!);
  const testConnection = useTestDeviceConnection();

  const analyzers = devices.filter(d => d.type === 'analyzer');
  const muxes     = devices.filter(d => d.type === 'mux');

  const getTestState = (device: DeviceResponse): TestState => {
    if (testingDeviceId === device.id) return 'testing';
    if (lastResult?.id === device.id) return lastResult.success ? 'success' : 'error';
    return 'idle';
  };

  const handleTest = (device: DeviceResponse) => {
    if (!device.ip) return;
    setTestingDeviceId(device.id);
    setLastResult(null);
    testConnection.mutate(
        { type: device.type as 'analyzer' | 'mux', ip: device.ip, port: 3570 },
        {
          onSettled: (_data, error) => {
            setTestingDeviceId(null);
            setLastResult({ id: device.id, success: !error });
          },
        },
    );
  };

  const handleAdd = (type: 'analyzer' | 'mux') => {
    setSelectedDevice(null);
    setModalType(type);
    setShowModal(true);
  };

  const handleEdit = (device: DeviceResponse) => {
    setSelectedDevice(device);
    setModalType(device.type as 'analyzer' | 'mux');
    setShowModal(true);
  };

  const handleDelete = (device: DeviceResponse) => {
    if (window.confirm(`Eliminar dispositivo "${device.name}"?`)) {
      deleteDevice.mutate(device.id);
    }
  };

  if (isLoading) return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
  );

  return (
      <KronosLayout title="Dispositivos" subtitle="Gestión de equipos">
        <KronosPageHeader
            title="Dispositivos"
            description="Analizadores y MUX del proyecto"
            actions={
              <KronosButton
                  variant="outline"
                  size="sm"
                  leftIcon={<ArrowLeft className="size-4" />}
                  onClick={() => navigate(`/projects/${projectId}`)}
              >
                Volver
              </KronosButton>
            }
        />

        <div className="grid gap-6 lg:grid-cols-2">

          {/* ── Analizadores ── */}
          <KronosSection
              title="Analizadores"
              description="Equipos de medición de impedancia"
              actions={
                <KronosButton
                    size="sm"
                    leftIcon={<Plus className="size-4" />}
                    onClick={() => handleAdd('analyzer')}
                >
                  Agregar
                </KronosButton>
              }
          >
            <div className="space-y-2">
              {analyzers.length === 0 ? (
                  <KronosCard className="flex flex-col items-center justify-center gap-2 py-8 border-dashed border-muted-foreground/30">
                    <Cpu className="size-6 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">No hay analizadores agregados</p>
                  </KronosCard>
              ) : analyzers.map(d => (
                  <DeviceRow
                      key={d.id}
                      device={d}
                      testState={getTestState(d)}
                      onTest={handleTest}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                  />
              ))}
            </div>
          </KronosSection>

          {/* ── MUX ── */}
          <KronosSection
              title="Multiplexores MUX"
              description="Equipos de multiplexación de canales"
              actions={
                <KronosButton
                    size="sm"
                    leftIcon={<Plus className="size-4" />}
                    onClick={() => handleAdd('mux')}
                >
                  Agregar
                </KronosButton>
              }
          >
            <div className="space-y-2">
              {muxes.length === 0 ? (
                  <KronosCard className="flex flex-col items-center justify-center gap-2 py-8 border-dashed border-muted-foreground/30">
                    <Layers className="size-6 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">No hay MUX agregados</p>
                  </KronosCard>
              ) : muxes.map(d => (
                  <DeviceRow
                      key={d.id}
                      device={d}
                      testState={getTestState(d)}
                      onTest={handleTest}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                  />
              ))}
            </div>
          </KronosSection>

        </div>

        {showModal && (
            <DeviceFormModal
                projectId={projectId!}
                device={selectedDevice}
                defaultType={modalType}
                onClose={() => setShowModal(false)}
            />
        )}
      </KronosLayout>
  );
};

export default DevicesPage;