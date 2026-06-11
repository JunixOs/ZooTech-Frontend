import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastService } from '@core/notifications/toast.service';

@Component({
  selector: 'zt-toast',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);

  readonly toast = this.toastService.toast;

  close(): void {
    this.toastService.hide();
  }
}
