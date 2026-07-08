import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { AppContext } from '@modules/auth/domain/auth.model';
import { filter } from 'rxjs';

@Component({
  selector: 'zt-shell',
  imports: [Header, Sidebar, RouterOutlet, ToastComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly router = inject(Router);

  sidebarCollapsed = signal(window.innerWidth < 1024);
  sidebarMobileOpen = signal(false);
  appContext = signal<AppContext>(this.getAppContextFromUrl(this.router.url));

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.appContext.set(this.getAppContextFromUrl(event.urlAfterRedirects));
    });
  }

  toggleSidebar(): void {
    if (window.innerWidth < 768) {
      this.sidebarMobileOpen.update((v) => !v);
    } else {
      this.sidebarCollapsed.update((v) => !v);
    }
  }

  private getAppContextFromUrl(url: string): AppContext {
    return url.startsWith('/admin') ? 'admin' : 'tenant';
  }
}
