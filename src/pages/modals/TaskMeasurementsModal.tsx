import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { KronosBadge, KronosButton, KronosLoader } from '../../components/kronos';
import { fetchTaskReport } from '../../hooks/useReports';
import { downloadFromApi, readBlobError } from '../../lib/download';
import { getErrorMessage, type ApiErrorResponse } from '../../types/api';
import { WATCHER_BADGE } from '../../types/report.types';

interface Props { taskId: number; taskName: string; onClose: () => void }

const TaskMeasurementsModal = ({ taskId, taskName, onClose }: Props) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', 'task', taskId, 'all'],
    queryFn: () => fetchTaskReport(taskId, {}),
  });

  const download = async (id: number) => {
    try {
      await downloadFromApi(`/reports/measurement/${id}/csv`);
    } catch (err) {
      toast.error(getErrorMessage(await readBlobError(err)));
    }
  };

  const items = [...(data?.measurements ?? [])].reverse(); // más recientes primero

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mediciones — {taskName}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] divide-y divide-border overflow-y-auto">
          {isLoading && <KronosLoader />}
          {!isLoading && error && (
            <p className="py-6 text-center text-sm text-red-500">
              {getErrorMessage((error as AxiosError<ApiErrorResponse>).response?.data)}
            </p>
          )}
          {!isLoading && !error && items.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Esta tarea no tiene mediciones</p>
          )}
          {items.map((m) => {
            const badge = m.watcherStatus ? WATCHER_BADGE[m.watcherStatus] : null;
            return (
              <div key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm text-foreground">
                    #{m.id} · {m.takenAt ? new Date(m.takenAt).toLocaleString('es-PE') : '—'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.takenByName ?? '—'} · {m.presetName ?? 'Sin preset'}
                    {m.watcherReason ? ` · ${m.watcherReason}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {badge && <KronosBadge variant={badge.variant} size="sm">{badge.label}</KronosBadge>}
                  <KronosButton size="sm" variant="outline" leftIcon={<Download className="size-3.5" />} onClick={() => download(m.id)}>
                    CSV
                  </KronosButton>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskMeasurementsModal;
