import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'zt-toast',
  standalone: true,
  imports: [TranslatePipe],
  template: `@if (toastService.toast()) {
    <div class="toast" [class]="toastService.toast()!.type">
      {{ toastService.toast()!.message | translate }}
    </div>
  }`,
  styleUrl: './toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  toastService = inject(ToastService);
}
