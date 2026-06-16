import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NavItem } from './models/nav-item.model';
import { SidebarNavItem } from './components/sidebar-nav-item/sidebar-nav-item';

@Component({
  selector: 'zt-sidebar',
  imports: [SidebarNavItem, TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  collapsed = input<boolean>(false);
  close = output<void>();
  toggleCollapse = output<void>();
  logout = output<void>();
  hasNotifications = signal(true);

  navSections = signal<NavItem[]>([
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
        { icon: 'fa-regular fa-file-lines', label: 'sidebar.reportes', router: '/sanidad/reportes' },
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
            { icon: 'fa-solid fa-list-ul', label: 'sidebar.vacasEnCelo', router: '/reproduccion/celo/vacas' },
            { icon: 'fa-regular fa-file-lines', label: 'sidebar.reportes', router: '/reproduccion/celo/reportes' },
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
        { icon: 'fa-regular fa-circle', label: 'sidebar.registroClientes', router: '/tenencia/registro' },
      ],
    },
  ]);
}
