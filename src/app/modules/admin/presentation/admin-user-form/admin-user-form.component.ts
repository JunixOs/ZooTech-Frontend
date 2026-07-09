import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminUserApiService } from '../../infrastructure/admin-user-api.service';
import { CreateAdminUserRequest } from '../../domain/admin-user.model';

@Component({
  selector: 'zt-admin-user-form',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './admin-user-form.component.html',
  styleUrl: './admin-user-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserFormComponent {
  private readonly adminUserService = inject(AdminUserApiService);

  created = output<void>();
  cancelled = output<void>();

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  formData: CreateAdminUserRequest = {
    email: '',
    userName: '',
    password: '',
    firstName: '',
    lastName: '',
    isActive: true,
  };

  onSubmit(): void {
    if (!this.formData.email || !this.formData.userName || !this.formData.password) {
      this.error.set('admin.users.form.errors.required');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.adminUserService.createAdminUser(this.formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.created.emit();
      },
      error: (err) => {
        this.error.set('admin.users.form.errors.createFailed');
        this.submitting.set(false);
        console.error(err);
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
