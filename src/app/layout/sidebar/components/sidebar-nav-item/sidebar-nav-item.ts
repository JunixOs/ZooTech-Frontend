import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
<<<<<<< Updated upstream
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavSection } from '../../models/nav-item.model';

@Component({
  selector: 'app-sidebar-nav-item',
  imports: [CommonModule, RouterModule],
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
=======
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NavItem } from '../../models/nav-item.model';

@Component({
  selector: 'zt-sidebar-nav-item',
  imports: [NgClass, NgTemplateOutlet, RouterModule, TranslatePipe, SidebarNavItem],
  templateUrl: './sidebar-nav-item.html',
  styleUrl: './sidebar-nav-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarNavItem {
  section = input.required<NavItem>();
  collapsed = input<boolean>(false);
  level = input<number>(1);
  isOpen = signal(false);

  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }
}
>>>>>>> Stashed changes
