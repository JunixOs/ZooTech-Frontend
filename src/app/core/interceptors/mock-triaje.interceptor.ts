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
  // Últimos 30 días (pesos variados)
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

  // Datos históricos — más de 6 meses atrás para que se vean varios meses en el gráfico
  makeTriaje(16, 1, 'V-001', 'Lola', 150, 37.8, 'CONTROL'),
  makeTriaje(17, 2, 'V-002', 'Blanquita', 160, 34.5, 'CONTROL'),
  makeTriaje(18, 3, 'V-003', 'Negra', 140, 48.2, 'CONTROL'),
  makeTriaje(19, 4, 'V-004', 'Pintada', 180, 32.1, 'CONTROL'),
  makeTriaje(20, 5, 'V-005', 'Rosa', 170, 44.6, 'CONTROL'),

  makeTriaje(21, 1, 'V-001', 'Lola', 210, 36.5, 'CONTROL'),
  makeTriaje(22, 2, 'V-002', 'Blanquita', 220, 33.0, 'CONTROL'),
  makeTriaje(23, 3, 'V-003', 'Negra', 200, 46.7, 'CONTROL'),
  makeTriaje(24, 4, 'V-004', 'Pintada', 240, 30.5, 'CONTROL'),
  makeTriaje(25, 5, 'V-005', 'Rosa', 230, 42.3, 'CONTROL'),

  makeTriaje(26, 1, 'V-001', 'Lola', 300, 34.2, 'DEST'),
  makeTriaje(27, 2, 'V-002', 'Blanquita', 310, 31.0, 'DEST'),
  makeTriaje(28, 3, 'V-003', 'Negra', 290, 44.0, 'CONTROL'),
  makeTriaje(29, 4, 'V-004', 'Pintada', 320, 28.8, 'CONTROL'),
  makeTriaje(30, 5, 'V-005', 'Rosa', 330, 40.1, 'CONTROL'),

  makeTriaje(31, 1, 'V-001', 'Lola', 365, 30.0, 'NAC'),
  makeTriaje(32, 3, 'V-003', 'Negra', 365, 28.5, 'NAC'),
  makeTriaje(33, 5, 'V-005', 'Rosa', 365, 26.0, 'NAC'),
];

function historialEntry(id: number, daysAgo: number, pesoKg: number, tipoPesoCode: string, observaciones: string | null): Record<string, unknown> {
  return { id, fechaHora: new Date(Date.now() - daysAgo * 86400000).toISOString(), pesoKg, tipoPesoCode, observaciones };
}

const HISTORIAL_VACUNO: Record<number, Record<string, unknown>[]> = {
  1: [
    historialEntry(101, 0, 42.5, 'CONTROL', 'Buena condicion corporal'),
    historialEntry(102, 7, 41.8, 'CONTROL', null),
    historialEntry(103, 30, 40.2, 'CONTROL', null),
    historialEntry(104, 60, 39.5, 'CONTROL', null),
    historialEntry(105, 90, 38.0, 'CONTROL', null),
    historialEntry(106, 150, 37.8, 'CONTROL', null),
    historialEntry(107, 210, 36.5, 'CONTROL', null),
    historialEntry(108, 300, 34.2, 'DEST', 'Destete'),
    historialEntry(109, 365, 30.0, 'NAC', 'Nacimiento'),
  ],
  2: [
    historialEntry(201, 0, 38.2, 'CONTROL', null),
    historialEntry(202, 10, 37.5, 'CONTROL', 'Estable'),
    historialEntry(203, 45, 36.8, 'CONTROL', null),
    historialEntry(204, 160, 34.5, 'CONTROL', null),
    historialEntry(205, 220, 33.0, 'CONTROL', null),
    historialEntry(206, 310, 31.0, 'DEST', 'Destete'),
  ],
  3: [
    historialEntry(301, 5, 52.1, 'ANUAL', 'Peso anual excelente'),
    historialEntry(302, 15, 51.8, 'CONTROL', null),
    historialEntry(303, 90, 50.4, 'CONTROL', null),
    historialEntry(304, 140, 48.2, 'CONTROL', null),
    historialEntry(305, 200, 46.7, 'CONTROL', null),
    historialEntry(306, 290, 44.0, 'CONTROL', null),
    historialEntry(307, 365, 28.5, 'NAC', 'Nacimiento'),
  ],
  4: [
    historialEntry(401, 3, 35.7, 'DEST', 'Al destete'),
    historialEntry(402, 20, 34.9, 'CONTROL', null),
    historialEntry(403, 180, 32.1, 'CONTROL', null),
    historialEntry(404, 240, 30.5, 'CONTROL', null),
    historialEntry(405, 320, 28.8, 'CONTROL', null),
  ],
  5: [
    historialEntry(501, 2, 48.3, 'CONTROL', null),
    historialEntry(502, 5, 49.0, 'VENTA', 'Lista para venta'),
    historialEntry(503, 12, 47.1, 'ANUAL', null),
    historialEntry(504, 170, 44.6, 'CONTROL', null),
    historialEntry(505, 230, 42.3, 'CONTROL', null),
    historialEntry(506, 330, 40.1, 'CONTROL', null),
    historialEntry(507, 365, 26.0, 'NAC', 'Nacimiento'),
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

  // GET /api/v1/triaje/reportes/resumen
  if (url.includes('/reportes/resumen') && method === 'GET') {
    const pesos = ALL_TRIAAJES.map((t) => t['pesoKg'] as number);
    const pesoMin = Math.min(...pesos);
    const pesoMax = Math.max(...pesos);
    const pesoAvg = +(pesos.reduce((a, b) => a + b, 0) / pesos.length).toFixed(2);
    const vacunosUnicos = new Set(ALL_TRIAAJES.map((t) => t['vacunoId'] as number));
    const tipoCount: Record<string, { cantidad: number; nombre: string }> = {};
    for (const t of ALL_TRIAAJES) {
      const code = t['tipoPesoCode'] as string;
      if (!tipoCount[code]) {
        const tp = TIPOS_PESO.find((p) => p.code === code);
        tipoCount[code] = { cantidad: 0, nombre: tp?.nombre ?? code };
      }
      tipoCount[code].cantidad++;
    }

    return of(new HttpResponse({
      status: HttpStatusCode.Ok,
      body: {
        data: {
          totalTriajes: ALL_TRIAAJES.length,
          pesoPromedioKg: pesoAvg,
          pesoMinimoKg: pesoMin,
          pesoMaximoKg: pesoMax,
          totalVacunosEvaluados: vacunosUnicos.size,
          distribucionTipoPeso: Object.entries(tipoCount).map(([code, v]) => ({
            code,
            nombre: v.nombre,
            cantidad: v.cantidad,
          })),
        },
        success: true,
        errorMessage: null,
      },
    })).pipe(delay(400));
  }

  // GET /api/v1/triaje/reportes/peso-promedio
  if (url.includes('/reportes/peso-promedio') && method === 'GET') {
    console.log('🎯 Mock interceptor matched: peso-promedio');
    const meses: Record<string, { suma: number; count: number }> = {};
    for (const t of ALL_TRIAAJES) {
      const d = new Date(t['fechaHora'] as string);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!meses[key]) meses[key] = { suma: 0, count: 0 };
      meses[key].suma += t['pesoKg'] as number;
      meses[key].count++;
    }
    const items = Object.entries(meses)
      .map(([fecha, v]) => ({
        fecha,
        pesoPromedio: +(v.suma / v.count).toFixed(2),
        cantidadRegistros: v.count,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    return of(new HttpResponse({
      status: HttpStatusCode.Ok,
      body: { data: items, success: true, errorMessage: null },
    })).pipe(delay(400));
  }

  // GET /api/v1/triaje/reportes/distribucion-tipo-peso
  if (url.includes('/reportes/distribucion-tipo-peso') && method === 'GET') {
    const tipoCount: Record<string, { cantidad: number; nombre: string }> = {};
    for (const t of ALL_TRIAAJES) {
      const code = t['tipoPesoCode'] as string;
      if (!tipoCount[code]) {
        const tp = TIPOS_PESO.find((p) => p.code === code);
        tipoCount[code] = { cantidad: 0, nombre: tp?.nombre ?? code };
      }
      tipoCount[code].cantidad++;
    }
    const items = Object.entries(tipoCount).map(([code, v]) => ({
      code,
      nombre: v.nombre,
      cantidad: v.cantidad,
    }));

    return of(new HttpResponse({
      status: HttpStatusCode.Ok,
      body: { data: items, success: true, errorMessage: null },
    })).pipe(delay(300));
  }

  // GET /api/v1/triaje/:id (detalle individual)
  const triajeIdMatch = url.match(/\/api\/v1\/triaje\/(\d+)$/);
  if (triajeIdMatch && method === 'GET') {
    const id = parseInt(triajeIdMatch[1], 10);
    const triaje = ALL_TRIAAJES.find((t) => t['id'] === id);
    return of(new HttpResponse({
      status: triaje ? HttpStatusCode.Ok : HttpStatusCode.NotFound,
      body: {
        data: triaje ?? null,
        success: !!triaje,
        errorMessage: triaje ? null : 'Triaje no encontrado',
      },
    })).pipe(delay(200));
  }

  // GET /api/v1/triaje (listado paginado)
  if (!url.includes('/reporte') && !url.includes('/reportes') && !url.includes('/vacunos') && !url.includes('/tipos-peso') && !url.includes('/historial') && method === 'GET') {
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
        data: {
          data: page,
          totalRegistros: total,
          pagina,
          tamano,
          totalPaginas,
        },
        success: true,
        errorMessage: null,
      },
    })).pipe(delay(350));
  }

  return next(req);
};
