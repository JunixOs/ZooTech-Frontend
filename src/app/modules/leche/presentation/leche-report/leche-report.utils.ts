export function toDateStr(d: Date): string {
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const fechaCache = new Map<string, Date>();

export function parseFechaHora(fecha: string, hora: string): Date {
  const key = `${fecha}|${hora}`;
  const cached = fechaCache.get(key);
  if (cached) return cached;
  const [d, m, y] = fecha.split('/').map(Number);
  const [h, min] = hora.split(':').map(Number);
  const date = new Date(y, m - 1, d, h, min);
  if (fechaCache.size > 5000) fechaCache.clear();
  fechaCache.set(key, date);
  return date;
}

export function generateCSV<T>(
  data: T[],
  headers: string[],
  extractor: (item: T) => string[],
): string {
  const sep = ';';
  const lines = [headers.join(sep)];
  for (const item of data) {
    lines.push(extractor(item).join(sep));
  }
  return lines.join('\n');
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob(['\uFEFF' + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
