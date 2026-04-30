import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'zt-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="layout-wrapper">
      <zt-sidebar class="layout-sidebar" />
      <div class="layout-content">
        <zt-header />
        <main class="main-viewport">
          <router-outlet />
        </main>
        <zt-footer />
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper { display: flex; height: 100vh; overflow: hidden; }
    .layout-content { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
    .main-viewport { flex: 1; padding: 1.5rem; background-color: #f8fafc; }
  `]
})
export class ShellComponent {}
