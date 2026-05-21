import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'zt-shell',
  standalone: true,
  imports: [Header, Sidebar, Footer, RouterOutlet, NgClass],
  templateUrl: './shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  sidebarCollapsed = signal(false);
  sidebarMobileOpen = signal(false);

  toggleSidebar(): void {
    if (window.innerWidth < 1024) {
      this.sidebarMobileOpen.update((v) => !v);
    } else {
      this.sidebarCollapsed.update((v) => !v);
    }
  }
}
