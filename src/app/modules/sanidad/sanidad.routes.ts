import { pattern } from '@angular/forms/signals';
import { Routes } from '@angular/router';

export const SANIDAD_ROUTES: Routes = [
  {
    path: 'triaje',
    loadComponent: () =>
      import('./triaje/presentation/triaje-container/triaje-container').then(
        (m) => m.TriajeContainer,
      ),
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./reportes/presentation/reporte-container/reporte-container').then(
        (m) => m.ReporteContainer,
      ),
      children:[
        {
          path: 'listadoGeneral',
          loadComponent: () =>
            import('./reportes/presentation/reporte-container/reporte-listado-general/reporte-listado-general').then(
              (m) => m.ReporteListadoGenereal,
            )
        }
      ]
  },
];