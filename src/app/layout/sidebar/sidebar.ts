import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NavItem } from './models/nav-item.model';
import { SidebarNavItem } from './components/sidebar-nav-item/sidebar-nav-item';

@Component({
  selector: 'zt-sidebar',
  imports: [SidebarNavItem, NgClass],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  collapsed = input<boolean>(false);
  close = output<void>();

  navSections = signal<NavItem[]>([
    {
      icon: 'fa-solid fa-cow',
      label: 'sidebar.vacunos',
      children: [
        { icon: 'fa-solid fa-circle-dot', label: 'sidebar.listadoVacunos', router: '/vacunos/listado' },
        { icon: 'fa-solid fa-file-lines', label: 'sidebar.reportes', router: '/vacunos/reportes' },
      ],
    },
    {
      icon: 'fa-solid fa-bottle-droplet',
      label: 'sidebar.milkProduction',
      children: [
        { icon: 'fa-solid fa-circle-dot', label: 'sidebar.milkItem', router: '/leche/registro' },
      ],
    },
    {
      icon: 'fa-solid fa-suitcase-medical',
      label: 'sidebar.sanidad',
      children: [
        { icon: 'fa-solid fa-stethoscope', label: 'sidebar.triaje', router: '/sanidad/triaje' },
        { icon: 'fa-solid fa-file-lines', label: 'sidebar.reportes', router: '/sanidad/reportes' },
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
            { icon: 'fa-solid fa-file-lines', label: 'sidebar.reportes', router: '/reproduccion/celo/reportes' },
          ],
        },
        { icon: 'fa-solid fa-syringe', label: 'sidebar.fecundacion', router: '/reproduccion/fecundacion' },
      ],
    },
    {
      icon: 'fa-solid fa-building',
      label: 'sidebar.tenancia',
      children: [
        { icon: 'fa-solid fa-circle-dot', label: 'sidebar.registroTenencia', router: '/tenencia/registro' },
      ],
    },
  ]);
}
