import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'zt-shell',
  imports: [Header, Sidebar, Footer, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  sidebarCollapsed = signal(window.innerWidth < 1024);
  sidebarMobileOpen = signal(false);

  toggleSidebar(): void {
    if (window.innerWidth < 768) {
      this.sidebarMobileOpen.update((v) => !v);
    } else {
      this.sidebarCollapsed.update((v) => !v);
    }
  }
}
