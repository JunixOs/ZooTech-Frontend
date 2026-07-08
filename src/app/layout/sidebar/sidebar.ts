import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { AppContext } from '@modules/auth/domain/auth.model';
import { TranslatePipe } from '@ngx-translate/core';
import { NavItem } from './models/nav-item.model';
import { SidebarNavItem } from './components/sidebar-nav-item/sidebar-nav-item';

const TENANT_NAV_SECTIONS: NavItem[] = [
  {
    icon: 'fa-solid fa-cow',
    label: 'sidebar.vacunos',
    router: '/vacunos/listado',
    children: [
      { icon: 'fa-solid fa-circle-plus', label: 'sidebar.agregarVacuno', router: '/vacunos/agregar' },
      { icon: 'fa-regular fa-file-lines', label: 'sidebar.reportes', router: '/vacunos/reportes' },
    ],
  },
  {
    icon: 'fa-solid fa-bottle-droplet',
    label: 'sidebar.milkProduction',
    children: [
      { icon: 'fa-regular fa-circle', label: 'sidebar.milkItem', router: '/leche/registro' },
      { icon: 'fa-regular fa-file-lines', label: 'sidebar.reportes', router: '/leche/reporte' },
    ],
  },
  {
    icon: 'fa-solid fa-suitcase-medical',
    label: 'sidebar.sanidad',
    children: [
      { icon: 'fa-solid fa-stethoscope', label: 'sidebar.triaje', router: '/sanidad/triaje' },
      {
        icon: 'fa-regular fa-file-lines',
        label: 'sidebar.reportes',
        router: '/sanidad/reportes',
      },
    ],
  },
  {
    icon: 'fa-solid fa-cow',
    label: 'sidebar.reproduccion',
    children: [
      {
        icon: 'fa-solid fa-cow',
        label: 'sidebar.celo',
        router: '/reproduccion/celo',
        children: [
          {
            icon: 'fa-solid fa-list-ul',
            label: 'sidebar.vacasEnCelo',
            router: '/reproduccion/celo/vacas',
          },
          {
            icon: 'fa-regular fa-file-lines',
            label: 'sidebar.reportes',
            router: '/reproduccion/celo/reportes',
          },
        ],
      },
      {
        icon: 'fa-solid fa-syringe',
        label: 'sidebar.fecundacion',
        router: '/reproduccion/fecundacion',
        children: [
          { icon: 'fa-solid fa-circle-plus', label: 'sidebar.registroF', router: '/reproduccion/fecundacion/registrar' },
          { icon: 'fa-solid fa-file-lines', label: 'sidebar.estadoF', router: '/reproduccion/fecundacion/estadodefecundacion' },
        ],
      },
    ],
  },
  {
    icon: 'fa-regular fa-building',
    label: 'sidebar.clientes',
    children: [
      {
        icon: 'fa-regular fa-circle',
        label: 'sidebar.registroClientes',
        router: '/tenencia/registro',
      },
    ],
  },
];

const ADMIN_NAV_SECTIONS: NavItem[] = [
  { icon: 'fa-solid fa-chart-line', label: 'sidebar.admin.dashboard', router: '/admin' },
  { icon: 'fa-regular fa-building', label: 'sidebar.admin.tenants', router: '/admin/tenants' },
  { icon: 'fa-regular fa-user', label: 'sidebar.admin.users', router: '/admin/users' },
  { icon: 'fa-solid fa-shield-halved', label: 'sidebar.admin.audit', router: '/admin/audit' },
  { icon: 'fa-solid fa-sliders', label: 'sidebar.admin.parameters', router: '/admin/parameters' },
  { icon: 'fa-solid fa-gear', label: 'sidebar.admin.settings', router: '/admin/settings' },
];

@Component({
  selector: 'zt-sidebar',
  imports: [SidebarNavItem, TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  collapsed = input<boolean>(false);
  appContext = input<AppContext>('tenant');
  close = output<void>();
  toggleCollapse = output<void>();
  logout = output<void>();
  hasNotifications = signal(true);

  navSections = computed(() =>
    this.appContext() === 'admin' ? ADMIN_NAV_SECTIONS : TENANT_NAV_SECTIONS,
  );
}
