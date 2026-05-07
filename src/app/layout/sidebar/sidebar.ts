import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NavSection } from './models/nav-item.model';
import { SidebarNavItem } from './components/sidebar-nav-item/sidebar-nav-item';

@Component({
  selector: 'app-sidebar',
  imports: [SidebarNavItem],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  navSections = signal<NavSection[]>([
    {
      icon: 'fa-solid fa-cow',
      label: 'VACUNOS',
      router: 'vacuno',
    },

    {
      icon: 'fa-solid fa-droplet',
      label: 'PRODUCCIÓN DE LECHE',
      children: [
        {
          icon: 'fa-solid fa-triangle-exclamation',
          label: 'item',
          router: '/PRODUCCIÓN DE LECHE/item',
        },
      ],
    },
    {
      icon: 'fa-solid fa-briefcase-medical',
      label: 'SANIDAD',
      children: [
        {
          icon: 'fa-solid fa-triangle-exclamation',
          label: 'Incidentes',
          router: '/sanidad/incidentes',
        },
        { icon: 'fa-solid fa-stethoscope', label: 'Triaje', router: '/sanidad/triaje' },
        { icon: 'fa-solid fa-pills', label: 'Medicamentos', router: '/sanidad/medicamentos' },
        { icon: 'fa-solid fa-ban', label: 'Dar de baja', router: '/sanidad/baja' },
        {
          icon: 'fa-solid fa-calendar-days',
          label: 'Calendario Sanidad',
          router: '/sanidad/calendario',
        },
        { icon: 'fa-solid fa-chart-bar', label: 'Reportes', router: '/sanidad/reportes' },
      ],
    },
    {
      icon: 'fa-solid fa-paw',
      label: 'REPRODUCCIÓN',
      children: [
        { icon: 'fa-solid fa-plus', 
          label: 'Celo', 
          router: '/reproduccion/Celo' 
        },
        { icon: 'fa-solid fa-list', label: 'Fecundacion', router: '/reproduccion/Fecundacion' },
      ],
    },
  ]);
}
