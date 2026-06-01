<<<<<<< Updated upstream
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
      router: 'vacunos',
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
=======
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
      router: '/vacunos',
      children: [
        { icon: 'fa-solid fa-circle-plus', label: 'sidebar.agregarVacuno', router: '/vacunos/agregar' },
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
>>>>>>> Stashed changes
      ],
    },
  ]);
}
