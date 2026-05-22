import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'zt-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  hamburgerClick = output<void>();
}
