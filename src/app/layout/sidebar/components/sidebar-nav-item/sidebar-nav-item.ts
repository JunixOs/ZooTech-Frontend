import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NavSection } from '../../models/nav-item.model';

@Component({
  selector: 'app-sidebar-nav-item',
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './sidebar-nav-item.html',
  styleUrl: './sidebar-nav-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarNavItem{
  section = input.required<NavSection>();
  isOpen = signal(false);

  toggle() {
    this.isOpen.set(!this.isOpen());
  }
}