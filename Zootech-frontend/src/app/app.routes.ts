import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./modules/auth/presentation/login/login.component')
      .then(m => m.LoginComponent),
    pathMatch: 'full'
  },
  {
    path: '',
    component: ShellComponent,
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./modules/dashboard/presentation/dashboard-container/dashboard-container.component')
          .then(m => m.DashboardContainerComponent) 
      },
      { 
        path: 'users', 
        loadComponent: () => import('./modules/users/presentation/users-container/users-container.component')
          .then(m => m.UsersContainerComponent) 
      },
      { 
        path: 'reports', 
        loadComponent: () => import('./modules/reports/presentation/reports-container/reports-container.component')
          .then(m => m.ReportsContainerComponent) 
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./modules/settings/presentation/settings-container/settings-container.component')
          .then(m => m.SettingsContainerComponent) 
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
