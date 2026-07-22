import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/theme/theme.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingDownloadComponent } from '@shared/ui/loading-download/loading-download.component';

@Component({
  selector: 'zt-root',
  standalone: true,
  imports: [RouterOutlet, ConfirmDialogComponent, LoadingDownloadComponent],
  template: `
    <router-outlet />
    <zt-confirm-dialog />
    <zt-loading-download />
  `,
})
export class AppComponent {
  private readonly themeService = inject(ThemeService);
}

