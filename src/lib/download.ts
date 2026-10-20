import apiClient from '../api/client';

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function filenameFrom(disposition: string | undefined, fallback: string): string {
  const match = disposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? fallback;
}

/** GET autenticado (token del interceptor) que descarga la respuesta como archivo. */
export async function downloadFromApi(path: string, params?: Record<string, string | undefined>): Promise<string> {
  const res = await apiClient.get(path, { params, responseType: 'blob' });
  const filename = filenameFrom(res.headers['content-disposition'], 'kronos.csv');
  saveBlob(res.data as Blob, filename);
  return filename;
}

/** Con responseType 'blob', el cuerpo de error también llega como Blob: lo convierte a objeto. */
export async function readBlobError(error: unknown): Promise<unknown> {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (data instanceof Blob) {
    try { return JSON.parse(await data.text()); } catch { return undefined; }
  }
  return data;
}
