import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'zt-shell',
  imports: [Header, Sidebar, Footer, RouterOutlet, NgClass],
  templateUrl: './shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  sidebarCollapsed = signal(false);
  sidebarMobileOpen = signal(false);

  toggleSidebar(): void {
    if (window.innerWidth < 1024) {
      this.sidebarMobileOpen.update((value) => !value);
      return;
    }

    this.sidebarCollapsed.update((value) => !value);
  }
}
