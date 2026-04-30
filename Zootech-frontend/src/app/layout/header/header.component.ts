import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'zt-header',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <header class="header">
      <div class="logo">Zootech</div>
      <div class="user-profile">
        <span>Admin User</span>
      </div>
    </header>
  `,
  styles: [`
    .header { 
      height: 64px; 
      background: white; 
      border-bottom: 1px solid #e2e8f0; 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      padding: 0 1.5rem; 
    }
    .logo { font-weight: bold; font-size: 1.25rem; color: #2563eb; }
  `]
})
export class HeaderComponent {}
