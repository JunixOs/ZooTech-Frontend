import { Routes } from '@angular/router';
import { LecheReport } from './leche-report';

export const LECHE_REPORT_ROUTES: Routes = [
  {
    path: '',
    component: LecheReport,
  },
  {
    path: 'produccion-diaria',
    loadComponent: () =>
      import('../leche-report-daily/produccion-diaria-report').then(
        (m) => m.ProduccionDiariaReport,
      ),
  },
  {
    path: 'produccion-vs-standard',
    loadComponent: () =>
      import('../leche-report-comparison/comparacion-produccion-report').then(
        (m) => m.ComparacionProduccionReport,
      ),
  },
  {
    path: 'produccion-por-vacuno',
    loadComponent: () =>
      import('../leche-report-produccion-por-vacuno/produccion-vacuno-report').then(
        (m) => m.ProduccionVacunoReport,
      ),
    data: { detailRoute: '/leche/reporte/produccion-por-vacuno' },
  },
  {
    path: 'produccion-por-vacuno/:codigo',
    loadComponent: () =>
      import('../leche-report-produccion-por-vacuno/detalle-vacuno-report').then(
        (m) => m.DetalleVacunoReport,
      ),
    data: { backRoute: '../produccion-por-vacuno' },
  },
  {
    path: 'produccion-vs-standard-vacuno',
    loadComponent: () =>
      import('../leche-report-produccion-por-vacuno/produccion-vacuno-report').then(
        (m) => m.ProduccionVacunoReport,
      ),
    data: { detailRoute: '/leche/reporte/produccion-vs-standard-vacuno' },
  },
  {
    path: 'produccion-vs-standard-vacuno/:codigo',
    loadComponent: () =>
      import('../leche-report-comparision-produccion-vacuno/detalle-vacuno-report').then(
        (m) => m.DetalleVacunoReport,
      ),
  },
  {
    path: 'vacas-sequia',
    loadComponent: () =>
      import('../leche-report-vacas-sequia/vacas-sequia-report').then((m) => m.VacasSequiaReport),
  },
];
