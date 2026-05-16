import { ChangeDetectionStrategy, Component,output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'zt-header',
  imports: [TranslatePipe,RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
    toggleSidebar = output<void>();
}
