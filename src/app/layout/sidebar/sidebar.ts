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
      label: 'SIDEBAR.VACUNOS',
      router: 'vacuno',
    },

    {
      icon: 'fa-solid fa-droplet',
      label: 'SIDEBAR.MILK_PRODUCTION',
      children: [
        {
          icon: 'fa-solid fa-triangle-exclamation',
          label: 'SIDEBAR.MILK_ITEM',
          router: '/PRODUCCIÓN DE LECHE/item',
        },
      ],
    },
    {
      icon: 'fa-solid fa-briefcase-medical',
      label: 'SIDEBAR.SANIDAD',
      children: [
        {
          icon: 'fa-solid fa-triangle-exclamation',
          label: 'SIDEBAR.INCIDENTES',
          router: '/sanidad/incidentes',
        },
        { icon: 'fa-solid fa-stethoscope', label: 'SIDEBAR.TRIAJE', router: '/sanidad/triaje' },
        { icon: 'fa-solid fa-pills', label: 'SIDEBAR.MEDICAMENTOS', router: '/sanidad/medicamentos' },
        { icon: 'fa-solid fa-ban', label: 'SIDEBAR.DAR_BAJA', router: '/sanidad/baja' },
        {
          icon: 'fa-solid fa-calendar-days',
          label: 'SIDEBAR.CALENDARIO',
          router: '/sanidad/calendario',
        },
        { icon: 'fa-solid fa-chart-bar', label: 'SIDEBAR.REPORTES', router: '/sanidad/reportes' },
      ],
    },
    {
      icon: 'fa-solid fa-paw',
      label: 'SIDEBAR.REPRODUCCION',
      children: [
        { icon: 'fa-solid fa-plus', 
          label: 'SIDEBAR.CELO', 
          router: '/reproduccion/Celo' 
        },
        { icon: 'fa-solid fa-list', label: 'SIDEBAR.FECUNDACION', router: '/reproduccion/Fecundacion' },
      ],
    },
  ]);
}
