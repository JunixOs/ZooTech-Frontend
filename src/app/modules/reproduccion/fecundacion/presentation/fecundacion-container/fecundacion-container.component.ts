import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-fecundacion-container',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './fecundacion-container.component.html',
  styleUrl: './fecundacion-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FecundacionContainerComponent {}
