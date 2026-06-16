import { HttpInterceptorFn, HttpRequest, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { of, delay } from 'rxjs';

const VACUNOS = [
  { id: 1, codigo: 'V-001', nombre: 'Lola' },
  { id: 2, codigo: 'V-002', nombre: 'Blanquita' },
  { id: 3, codigo: 'V-003', nombre: 'Negra' },
  { id: 4, codigo: 'V-004', nombre: 'Pintada' },
  { id: 5, codigo: 'V-005', nombre: 'Rosa' },
];

const TIPOS_PESO = [
  { code: 'NAC', nombre: 'Al nacer' },
  { code: 'DEST', nombre: 'Al destete' },
  { code: 'ANUAL', nombre: 'Anual' },
  { code: 'CONTROL', nombre: 'Control' },
  { code: 'VENTA', nombre: 'Venta' },
];

function makeTriaje(
  id: number,
  vacunoId: number,
  codigoVacuno: string,
  nombreVacuno: string,
  daysAgo: number,
  peso: number,
  tipoPeso: string,
): Record<string, unknown> {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(8 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
  return {
    id,
    codigo: `T-${String(id).padStart(4, '0')}`,
    fechaHora: date.toISOString(),
    vacunoId,
    vacunoNombre: `${codigoVacuno} — ${nombreVacuno}`,
    tipoPesoCode: tipoPeso,
    pesoKg: peso,
    observaciones: null,
    estadoRegistroCode: 'ACTIVO',
    encargadoUsuarioId: null,
    createdAt: date.toISOString(),
  };
}

const ALL_TRIAAJES: Record<string, unknown>[] = [
  makeTriaje(1, 1, 'V-001', 'Lola', 0, 42.5, 'CONTROL'),
  makeTriaje(2, 2, 'V-002', 'Blanquita', 0, 38.2, 'CONTROL'),
  makeTriaje(3, 1, 'V-001', 'Lola', 7, 41.8, 'CONTROL'),
  makeTriaje(4, 3, 'V-003', 'Negra', 5, 52.1, 'ANUAL'),
  makeTriaje(5, 4, 'V-004', 'Pintada', 3, 35.7, 'DEST'),
  makeTriaje(6, 2, 'V-002', 'Blanquita', 10, 37.5, 'CONTROL'),
  makeTriaje(7, 5, 'V-005', 'Rosa', 2, 48.3, 'CONTROL'),
  makeTriaje(8, 3, 'V-003', 'Negra', 15, 51.8, 'CONTROL'),
  makeTriaje(9, 1, 'V-001', 'Lola', 30, 40.2, 'CONTROL'),
  makeTriaje(10, 4, 'V-004', 'Pintada', 20, 34.9, 'CONTROL'),
  makeTriaje(11, 5, 'V-005', 'Rosa', 12, 47.1, 'ANUAL'),
  makeTriaje(12, 2, 'V-002', 'Blanquita', 45, 36.8, 'CONTROL'),
  makeTriaje(13, 1, 'V-001', 'Lola', 60, 39.5, 'CONTROL'),
  makeTriaje(14, 3, 'V-003', 'Negra', 90, 50.4, 'CONTROL'),
  makeTriaje(15, 5, 'V-005', 'Rosa', 5, 49.0, 'VENTA'),
];

const HISTORIAL_VACUNO: Record<number, Record<string, unknown>[]> = {
  1: [
    { id: 101, fechaHora: new Date(Date.now() - 0 * 86400000).toISOString(), pesoKg: 42.5, tipoPesoCode: 'CONTROL', observaciones: 'Buena condicion corporal' },
    { id: 102, fechaHora: new Date(Date.now() - 7 * 86400000).toISOString(), pesoKg: 41.8, tipoPesoCode: 'CONTROL', observaciones: null },
    { id: 103, fechaHora: new Date(Date.now() - 30 * 86400000).toISOString(), pesoKg: 40.2, tipoPesoCode: 'CONTROL', observaciones: null },
    { id: 104, fechaHora: new Date(Date.now() - 60 * 86400000).toISOString(), pesoKg: 39.5, tipoPesoCode: 'CONTROL', observaciones: null },
    { id: 105, fechaHora: new Date(Date.now() - 90 * 86400000).toISOString(), pesoKg: 38.0, tipoPesoCode: 'CONTROL', observaciones: null },
    { id: 106, fechaHora: new Date(Date.now() - 180 * 86400000).toISOString(), pesoKg: 35.2, tipoPesoCode: 'DEST', observaciones: 'Destete' },
  ],
  2: [
    { id: 201, fechaHora: new Date(Date.now() - 0 * 86400000).toISOString(), pesoKg: 38.2, tipoPesoCode: 'CONTROL', observaciones: null },
    { id: 202, fechaHora: new Date(Date.now() - 10 * 86400000).toISOString(), pesoKg: 37.5, tipoPesoCode: 'CONTROL', observaciones: 'Estable' },
    { id: 203, fechaHora: new Date(Date.now() - 45 * 86400000).toISOString(), pesoKg: 36.8, tipoPesoCode: 'CONTROL', observaciones: null },
    { id: 204, fechaHora: new Date(Date.now() - 120 * 86400000).toISOString(), pesoKg: 34.0, tipoPesoCode: 'DEST', observaciones: 'Destete' },
  ],
  3: [
    { id: 301, fechaHora: new Date(Date.now() - 5 * 86400000).toISOString(), pesoKg: 52.1, tipoPesoCode: 'ANUAL', observaciones: 'Peso anual excelente' },
    { id: 302, fechaHora: new Date(Date.now() - 15 * 86400000).toISOString(), pesoKg: 51.8, tipoPesoCode: 'CONTROL', observaciones: null },
    { id: 303, fechaHora: new Date(Date.now() - 90 * 86400000).toISOString(), pesoKg: 50.4, tipoPesoCode: 'CONTROL', observaciones: null },
    { id: 304, fechaHora: new Date(Date.now() - 365 * 86400000).toISOString(), pesoKg: 30.0, tipoPesoCode: 'NAC', observaciones: 'Nacimiento' },
  ],
  4: [
    { id: 401, fechaHora: new Date(Date.now() - 3 * 86400000).toISOString(), pesoKg: 35.7, tipoPesoCode: 'DEST', observaciones: 'Al destete' },
    { id: 402, fechaHora: new Date(Date.now() - 20 * 86400000).toISOString(), pesoKg: 34.9, tipoPesoCode: 'CONTROL', observaciones: null },
  ],
  5: [
    { id: 501, fechaHora: new Date(Date.now() - 2 * 86400000).toISOString(), pesoKg: 48.3, tipoPesoCode: 'CONTROL', observaciones: null },
    { id: 502, fechaHora: new Date(Date.now() - 5 * 86400000).toISOString(), pesoKg: 49.0, tipoPesoCode: 'VENTA', observaciones: 'Lista para venta' },
    { id: 503, fechaHora: new Date(Date.now() - 12 * 86400000).toISOString(), pesoKg: 47.1, tipoPesoCode: 'ANUAL', observaciones: null },
  ],
};

export const mockTriajeInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next) => {
  const { url, method } = req;

  if (!url.includes('/api/v1/triaje')) return next(req);

  // GET /api/v1/triaje/vacunos
  if (url.endsWith('/vacunos') && method === 'GET') {
    return of(new HttpResponse({
      status: HttpStatusCode.Ok,
      body: { data: VACUNOS, success: true, errorMessage: null },
    })).pipe(delay(300));
  }

  // GET /api/v1/triaje/tipos-peso
  if (url.endsWith('/tipos-peso') && method === 'GET') {
    return of(new HttpResponse({
      status: HttpStatusCode.Ok,
      body: { data: TIPOS_PESO, success: true, errorMessage: null },
    })).pipe(delay(200));
  }

  // GET /api/v1/triaje/historial/:id
  const historialMatch = url.match(/\/historial\/(\d+)/);
  if (historialMatch && method === 'GET') {
    const id = parseInt(historialMatch[1], 10);
    let data = HISTORIAL_VACUNO[id] ?? [];
    const params = req.params;
    const hStart = params.get('fechaInicio');
    const hEnd = params.get('fechaFin');
    if (hStart && hEnd) {
      const s = new Date(hStart).getTime();
      const e = new Date(hEnd).getTime();
      data = data.filter((item) => {
        const d = new Date(item['fechaHora'] as string).getTime();
        return d >= s && d <= e;
      });
    }
    return of(new HttpResponse({
      status: HttpStatusCode.Ok,
      body: { data, success: true, errorMessage: null },
    })).pipe(delay(400));
  }

  // GET /api/v1/triaje/reporte/general
  if (url.includes('/reporte/general') && method === 'GET') {
    const params = req.params;
    const start = params.get('fechaInicio');
    const end = params.get('fechaFin');
    let data = ALL_TRIAAJES;
    if (start && end) {
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      data = ALL_TRIAAJES.filter((t) => {
        const d = new Date(t['fechaHora'] as string).getTime();
        return d >= s && d <= e;
      });
    }
    return of(new HttpResponse({
      status: HttpStatusCode.Ok,
      body: { data, success: true, errorMessage: null },
    })).pipe(delay(500));
  }

  // GET /api/v1/triaje (listado paginado)
  if (!url.includes('/reporte') && !url.includes('/vacunos') && !url.includes('/tipos-peso') && !url.includes('/historial') && method === 'GET') {
    const params = req.params;
    const pagina = parseInt(params.get('pagina') ?? '1', 10);
    const tamano = parseInt(params.get('tamano') ?? '10', 10);
    const fechaInicio = params.get('fechaInicio');
    const fechaFin = params.get('fechaFin');
    const codigoFilter = params.get('codigo');
    const nombreFilter = params.get('nombre');
    const tipoPesoFilter = params.get('tipoPeso');

    let data = [...ALL_TRIAAJES];
    if (fechaInicio && fechaFin) {
      const s = new Date(fechaInicio).getTime();
      const e = new Date(fechaFin).getTime();
      data = data.filter((t) => {
        const d = new Date(t['fechaHora'] as string).getTime();
        return d >= s && d <= e;
      });
    }
    if (codigoFilter) data = data.filter((t) => (t['codigo'] as string).toLowerCase().includes(codigoFilter.toLowerCase()));
    if (nombreFilter) data = data.filter((t) => (t['vacunoNombre'] as string).toLowerCase().includes(nombreFilter.toLowerCase()));
    if (tipoPesoFilter) data = data.filter((t) => (t['tipoPesoCode'] as string).toLowerCase().includes(tipoPesoFilter.toLowerCase()));

    const total = data.length;
    const startIdx = (pagina - 1) * tamano;
    const page = data.slice(startIdx, startIdx + tamano);
    const totalPaginas = Math.max(1, Math.ceil(total / tamano));

    return of(new HttpResponse({
      status: HttpStatusCode.Ok,
      body: {
        data: page,
        totalRegistros: total,
        pagina,
        tamano,
        totalPaginas,
        success: true,
        errorMessage: null,
      },
    })).pipe(delay(350));
  }

  return next(req);
};
