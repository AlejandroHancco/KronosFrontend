import { createElement } from 'react';
import type { TaskReportData } from '../../types/report.types';
import { saveBlob } from '../../lib/download';
import { slug } from './format';

export async function generateTaskReportPdf(data: TaskReportData, generatedBy: string): Promise<void> {
  const [{ pdf }, { default: TaskReportDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./TaskReportDocument'),
  ]);
  const blob = await pdf(createElement(TaskReportDocument, { data, generatedBy }) as any).toBlob();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  saveBlob(blob, `reporte_${slug(data.task.name)}_${date}.pdf`);
}
