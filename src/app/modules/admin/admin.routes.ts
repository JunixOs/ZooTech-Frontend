import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./presentation/admin-users/admin-users.component').then(
        (m) => m.AdminUsersComponent,
      ),
  },
  {
    path: 'tenants',
    loadComponent: () =>
      import('./presentation/admin-tenants/admin-tenants.component').then(
        (m) => m.AdminTenantsComponent,
      ),
  },
  {
    path: 'audit',
    loadComponent: () =>
      import('./presentation/admin-audit/admin-audit.component').then(
        (m) => m.AdminAuditComponent,
      ),
  },
  {
    path: 'parameters',
    loadComponent: () =>
      import('./presentation/admin-parameters/admin-parameters.component').then(
        (m) => m.AdminParametersComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./presentation/admin-settings/admin-settings.component').then(
        (m) => m.AdminSettingsComponent,
      ),
  },
];
