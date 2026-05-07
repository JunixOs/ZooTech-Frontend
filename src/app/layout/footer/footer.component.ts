import { Component } from '@angular/core';

@Component({
  selector: 'zt-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <p>&copy; 2026 Zootech Enterprise. All rights reserved.</p>
    </footer>
  `,
  styles: [`
    .footer { 
      height: 48px; 
      background: white; 
      border-top: 1px solid #e2e8f0; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 0.875rem; 
      color: #64748b;
    }
  `]
})
export class FooterComponent {}
