import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NavSection } from './models/nav-item.model';
import { SidebarNavItem } from './components/sidebar-nav-item/sidebar-nav-item';

@Component({
  selector: 'zt-sidebar',
  imports: [SidebarNavItem],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  navSections = signal<NavSection[]>([
    {
      icon: 'fa-solid fa-cow',
      label: 'sidebar.vacunos',
      children: [
        {
          icon: 'fa-solid fa-circle-dot',
          label: 'sidebar.listadoVacunos',
          router: '/vacunos/listado',
        },
      ],
    },
    {
      icon: 'fa-solid fa-bottle-droplet',
      label: 'sidebar.milkProduction',
      children: [
        {
          icon: 'fa-solid fa-plus-circle',
          label: 'sidebar.milkItem',
          router: '/leche/registro',
        },
        {
          icon: 'fa-solid fa-chart-line',
          label: 'sidebar.reportes',
          router: '/leche/reporte',
        },
      ],
    },
    {
      icon: 'fa-solid fa-paw',
      label: 'sidebar.reproduccion',
      children: [
        { icon: 'fa-solid fa-circle-dot', label: 'sidebar.celo', router: '/reproduccion/celo' },
        {
          icon: 'fa-solid fa-circle-dot',
          label: 'sidebar.fecundacion',
          router: '/reproduccion/fecundacion',
        },
      ],
    },
    {
      icon: 'fa-solid fa-briefcase-medical',
      label: 'sidebar.sanidad',
      children: [
        { icon: 'fa-solid fa-stethoscope', label: 'sidebar.triaje', router: '/sanidad/triaje' },
      ],
    },
    {
      icon: 'fa-solid fa-building',
      label: 'sidebar.tenancia',
      children: [
        {
          icon: 'fa-solid fa-circle-dot',
          label: 'sidebar.registroTenencia',
          router: '/tenencia/registro',
        },
      ],
    },
  ]);
}
