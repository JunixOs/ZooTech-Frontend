import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-back-link',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './back-link.component.html',
  styleUrl: './back-link.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackLinkComponent {
  route = input.required<string>();
  labelKey = input<string>('shared.actions.back');
}
