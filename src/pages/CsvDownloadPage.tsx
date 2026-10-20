import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Loader2, AlertTriangle } from 'lucide-react';
import { KronosLayout, KronosCard, KronosButton } from '../components/kronos';
import { downloadFromApi, readBlobError } from '../lib/download';
import { getErrorMessage } from '../types/api';

type State = { kind: 'loading' } | { kind: 'done'; filename: string } | { kind: 'error'; message: string };

const CsvDownloadPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ kind: 'loading' });
  const startedFor = useRef<string | null>(null);

  useEffect(() => {
    if (startedFor.current === id) return; // StrictMode monta dos veces en dev
    startedFor.current = id ?? null;
    setState({ kind: 'loading' });
    downloadFromApi(`/reports/measurement/${id}/csv`)
      .then((filename) => setState({ kind: 'done', filename }))
      .catch(async (err) => {
        const status = err?.response?.status;
        const message =
          status === 403 ? 'No tienes permiso para exportar mediciones.'
          : status === 404 ? 'La medición no existe o no pertenece a tu equipo.'
          : getErrorMessage(await readBlobError(err));
        setState({ kind: 'error', message });
      });
  }, [id]);

  return (
    <KronosLayout title="Descarga CSV" subtitle={`Medición ${id}`}>
      <KronosCard className="mx-auto mt-10 max-w-md text-center">
        {state.kind === 'loading' && (
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Preparando el CSV…
          </p>
        )}
        {state.kind === 'done' && (
          <p className="flex items-center justify-center gap-2 text-sm text-foreground">
            <Download className="size-4" /> Descarga iniciada: <span className="font-mono">{state.filename}</span>
          </p>
        )}
        {state.kind === 'error' && (
          <p className="flex items-center justify-center gap-2 text-sm text-red-500">
            <AlertTriangle className="size-4" /> {state.message}
          </p>
        )}
        <KronosButton className="mt-6" variant="outline" size="sm" onClick={() => navigate('/reports')}>
          Ir a Reportes
        </KronosButton>
      </KronosCard>
    </KronosLayout>
  );
};

export default CsvDownloadPage;
