import { Routes } from '@angular/router';

export const FECUNDACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/fecundacion-container/fecundacion-container').then(
        (m) => m.FecundacionContainer,
      ),
  },
  {
    path: 'registrar',
    loadComponent: () =>
      import('./presentation/fecundacion-form/fecundacion-form').then(
        (m) => m.FecundacionForm,
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./presentation/fecundacion-form/fecundacion-form').then(
        (m) => m.FecundacionForm,
      ),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./presentation/fecundacion-detail/fecundacion-detail').then(
        (m) => m.FecundacionDetail,
      ),
  },
  {
    path: 'estado',
    loadComponent: () =>
      import('./presentation/estado-fecundacion-list/estado-fecundacion-list').then(
        (m) => m.EstadoFecundacionList,
      ),
  },
  {
    path: 'estado/:id',
    loadComponent: () =>
      import('./presentation/estado-fecundacion/estado-fecundacion').then(
        (m) => m.EstadoFecundacion,
      ),
  },
  {
    path: 'estadodefecundacion',
    loadComponent: () =>
      import('./presentation/estado-fecundacion-list/estado-fecundacion-list').then(
        (m) => m.EstadoFecundacionList,
      ),
  },
];
