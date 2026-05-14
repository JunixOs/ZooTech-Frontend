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
      icon: 'fa-solid fa-paw',
      label: 'SIDEBAR.REPRODUCCION',
      children: [
        { icon: 'fa-solid fa-circle-dot', label: 'SIDEBAR.CELO', router: '/reproduccion/celo' },
        { icon: 'fa-solid fa-seedling', label: 'SIDEBAR.FECUNDACION', router: '/reproduccion/fecundacion' },
      ],
    },
    {
      icon: 'fa-solid fa-briefcase-medical',
      label: 'SIDEBAR.SANIDAD',
      children: [
        { icon: 'fa-solid fa-stethoscope', label: 'SIDEBAR.TRIAJE', router: '/sanidad/triaje' },
      ],
    },
    {
      icon: 'fa-solid fa-droplet',
      label: 'SIDEBAR.MILK_PRODUCTION',
      router: '/produccion-leche',
    },
    {
      icon: 'fa-solid fa-id-card',
      label: 'SIDEBAR.TENANCIA',
      router: '/tenancia',
    },
    {
      icon: 'fa-solid fa-cow',
      label: 'SIDEBAR.VACUNOS',
      router: '/vacuno',
    },
  ]);
}
