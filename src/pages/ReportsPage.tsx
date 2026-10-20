import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Download, FileText, List } from 'lucide-react';
import { toast } from 'sonner';
import {
  KronosLayout, KronosPageHeader, KronosCard, KronosButton, KronosBadge, KronosTable, type KronosColumn,
} from '../components/kronos';
import { useReportTasks } from '../hooks/useReports';
import { useHasPermission } from '../hooks/useHasPermission';
import { downloadFromApi, readBlobError } from '../lib/download';
import { getErrorMessage } from '../types/api';
import type { ReportTaskRow, WatcherStatus } from '../types/report.types';
import TaskMeasurementsModal from './modals/TaskMeasurementsModal';

export const WATCHER_BADGE: Record<WatcherStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  correct: { label: 'Correcta', variant: 'success' },
  warning: { label: 'Advertencia', variant: 'warning' },
  error: { label: 'Error', variant: 'danger' },
};

const ReportsPage = () => {
  const canView = useHasPermission('report:view');
  const canExport = useHasPermission('report:export');
  const [projectId, setProjectId] = useState('');
  const [listTask, setListTask] = useState<ReportTaskRow | null>(null);
  const [pdfTask, setPdfTask] = useState<ReportTaskRow | null>(null);
  const { data: allTasks } = useReportTasks();
  const { data: tasks, isLoading } = useReportTasks(projectId || undefined);

  if (!canView) return <Navigate to="/403" replace />;

  const projects = Array.from(new Map((allTasks ?? []).map((t) => [t.projectId, t.projectName])).entries());

  const downloadTaskCsv = async (row: ReportTaskRow) => {
    try {
      await downloadFromApi(`/reports/task/${row.taskId}/csv`);
    } catch (err) {
      toast.error(getErrorMessage(await readBlobError(err)));
    }
  };

  const columns: KronosColumn<ReportTaskRow>[] = [
    { key: 'projectName', header: 'Proyecto' },
    { key: 'taskName', header: 'Tarea' },
    { key: 'measurementCount', header: 'Mediciones', align: 'right' },
    {
      key: 'lastMeasuredAt',
      header: 'Última medición',
      render: (v) => (v ? new Date(v as string).toLocaleString('es-PE') : '—'),
    },
    {
      key: 'statusCounts',
      header: 'Kronos Watcher',
      render: (_v, row) => (
        <div className="flex gap-1">
          {(Object.keys(WATCHER_BADGE) as WatcherStatus[])
            .filter((s) => row.statusCounts[s] > 0)
            .map((s) => (
              <KronosBadge key={s} variant={WATCHER_BADGE[s].variant} size="sm">
                {row.statusCounts[s]} {WATCHER_BADGE[s].label.toLowerCase()}
              </KronosBadge>
            ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (_v, row) => {
        const empty = row.measurementCount === 0;
        const title = empty ? 'Esta tarea no tiene mediciones' : undefined;
        return (
          <div className="flex justify-end gap-1.5">
            <KronosButton size="sm" variant="ghost" leftIcon={<List className="size-3.5" />} onClick={() => setListTask(row)} disabled={empty} title={title}>
              Mediciones
            </KronosButton>
            {canExport && (
              <>
                <KronosButton size="sm" variant="outline" leftIcon={<Download className="size-3.5" />} onClick={() => downloadTaskCsv(row)} disabled={empty} title={title}>
                  CSV
                </KronosButton>
                <KronosButton size="sm" leftIcon={<FileText className="size-3.5" />} onClick={() => setPdfTask(row)} disabled={empty} title={title}>
                  PDF
                </KronosButton>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <KronosLayout title="Reportes" subtitle="Exporta las mediciones de cada tarea">
      <KronosPageHeader
        title="Reportes"
        description="Genera el reporte PDF de una tarea o descarga sus mediciones en CSV."
      />

      <div className="mb-4 flex items-center gap-2">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos los proyectos</option>
          {projects.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      <KronosCard className="p-0">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <KronosTable columns={columns} data={tasks ?? []} emptyMessage="No hay tareas en tus proyectos" />
        )}
      </KronosCard>

      {listTask && (
        <TaskMeasurementsModal taskId={listTask.taskId} taskName={listTask.taskName} onClose={() => setListTask(null)} />
      )}
      {/* pdfTask → ReportOptionsModal (Task 8) */}
      {pdfTask && null}
    </KronosLayout>
  );
};

export default ReportsPage;
