import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'zt-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar">
      <ul>
        <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
        <li><a routerLink="/users" routerLinkActive="active">Users</a></li>
        <li><a routerLink="/reports" routerLinkActive="active">Reports</a></li>
        <li><a routerLink="/settings" routerLinkActive="active">Settings</a></li>
      </ul>
    </nav>
  `,
  styles: [`
    .sidebar { width: 240px; background: #1e293b; color: white; height: 100%; padding: 1.5rem 0; }
    ul { list-style: none; padding: 0; }
    li a { 
      display: block; 
      padding: 0.75rem 1.5rem; 
      color: #94a3b8; 
      text-decoration: none; 
      transition: all 0.2s;
    }
    li a:hover, li a.active { background: #334155; color: white; }
  `]
})
export class SidebarComponent {}
