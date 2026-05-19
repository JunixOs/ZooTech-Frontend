import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-vacunos-container',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './vacunos-container.component.html',
  styleUrl: './vacunos-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunosContainerComponent {}
