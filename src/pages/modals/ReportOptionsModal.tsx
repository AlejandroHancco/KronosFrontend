import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { KronosButton } from '../../components/kronos';
import { fetchTaskReport } from '../../hooks/useReports';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../types/api';

interface Props { taskId: number; taskName: string; onClose: () => void }

const inputCls = 'w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

const ReportOptionsModal = ({ taskId, taskName, onClose }: Props) => {
  const { user } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (from && to && from > to) {
      toast.error('La fecha "desde" debe ser anterior a "hasta"');
      return;
    }
    setBusy(true);
    try {
      const data = await fetchTaskReport(taskId, { from: from || undefined, to: to || undefined });
      if (data.measurements.length === 0) {
        toast.error('No hay mediciones en ese rango de fechas');
        return;
      }
      const { generateTaskReportPdf } = await import('../../reports/pdf/generateTaskReportPdf');
      const who = [user?.name, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Kronos';
      await generateTaskReportPdf(data, who);
      toast.success('Reporte generado');
      onClose();
    } catch (err) {
      const apiData = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(apiData ? getErrorMessage(apiData) : 'No se pudo generar el PDF');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reporte PDF — {taskName}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">Deja las fechas vacías para incluir todas las mediciones.</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-xs text-muted-foreground">
            Desde
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            Hasta
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <KronosButton variant="outline" size="sm" onClick={onClose} disabled={busy}>Cancelar</KronosButton>
          <KronosButton
            size="sm"
            onClick={generate}
            disabled={busy}
            leftIcon={busy ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
          >
            {busy ? 'Generando…' : 'Generar PDF'}
          </KronosButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportOptionsModal;
