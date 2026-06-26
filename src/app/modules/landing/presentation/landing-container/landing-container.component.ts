import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-landing',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './landing-container.component.html',
  styleUrl: './landing-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {}
