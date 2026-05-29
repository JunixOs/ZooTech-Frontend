import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from "@shared/components/toast/toast";

@Component({
  selector: 'zt-shell',
  imports: [Header, Sidebar, RouterOutlet, ToastComponent],
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
