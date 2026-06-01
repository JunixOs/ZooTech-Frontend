import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-tenencia-container',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './tenencia-container.component.html',
  styleUrl: './tenencia-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenenciaContainerComponent {}
