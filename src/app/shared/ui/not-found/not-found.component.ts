import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Home, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'zt-not-found',
  standalone: true,
  imports: [RouterLink, TranslateModule, LucideAngularModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  private readonly location = inject(Location);

  readonly Home = Home;
  readonly ArrowLeft = ArrowLeft;

  goBack(): void {
    this.location.back();
  }
}
