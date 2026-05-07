import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./modules/auth/presentation/login/login.component')
      .then(m => m.LoginComponent),
    pathMatch: 'full'
  },
  {
    path: '',
    component: Shell,
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./modules/dashboard/presentation/dashboard-container/dashboard-container.component')
          .then(m => m.DashboardContainerComponent) 
      },
      { 
      path: 'sanidad/triaje', 
      loadComponent: () => import('./modules/sanidad/presentation/triaje-container/triaje-container')
        .then(m => m.TriajeContainer) 
    },
    ]
  },
  { path: '**', redirectTo: '' }
];