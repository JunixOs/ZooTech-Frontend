import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sidebar-header',
  imports: [],
  templateUrl: './sidebar-header.html',
  styleUrl: './sidebar-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarHeader { }
