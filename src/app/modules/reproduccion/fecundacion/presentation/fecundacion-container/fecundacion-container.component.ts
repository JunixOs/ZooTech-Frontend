import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ClipboardList, History } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-fecundacion-container',
  standalone: true,
  imports: [RouterModule, LucideAngularModule, TranslatePipe],
  templateUrl: './fecundacion-container.component.html',
  styleUrl: './fecundacion-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FecundacionContainerComponent {
  readonly registrarIcon = ClipboardList;
  readonly historyIcon = History;
}
