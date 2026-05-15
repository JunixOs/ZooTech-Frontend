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
      icon: 'fa-solid fa-paw',
      label: 'sidebar.reproduccion',
      children: [
        { icon: 'fa-solid fa-circle-dot', label: 'sidebar.celo', router: '/reproduccion/celo' },
      ],
    },
    {
      icon: 'fa-solid fa-briefcase-medical',
      label: 'sidebar.sanidad',
      children: [
        { icon: 'fa-solid fa-stethoscope', label: 'sidebar.triaje', router: '/sanidad/triaje' },
        { icon: 'fa-solid fa-chart-line', label: 'sidebar.reportes', router: '/sanidad/reportes' },
      ],
    },
  ]);
}
