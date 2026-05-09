import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/dashboard-container/dashboard-container.component').then(
        (m) => m.DashboardContainerComponent,
      ),
  },
];
