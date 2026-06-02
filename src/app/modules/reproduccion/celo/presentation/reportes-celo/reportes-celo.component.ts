import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-reportes-celo',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './reportes-celo.component.html',
  styleUrl: './reportes-celo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesCeloComponent {}
