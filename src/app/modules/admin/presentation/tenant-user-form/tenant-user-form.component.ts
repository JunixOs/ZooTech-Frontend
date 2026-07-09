import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { TenantApiService } from '../../infrastructure/tenant-api.service';
import { CreateUserInTenantRequest } from '../../domain/tenant.model';

@Component({
  selector: 'zt-tenant-user-form',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './tenant-user-form.component.html',
  styleUrl: './tenant-user-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantUserFormComponent {
  private readonly tenantApiService = inject(TenantApiService);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  formData: CreateUserInTenantRequest = {
    code: '',
    userName: '',
    fullName: '',
    email: '',
    isActive: true,
    tenantDatabaseName: '',
  };

  onSubmit(): void {
    if (!this.formData.code || !this.formData.userName || !this.formData.email || !this.formData.tenantDatabaseName) {
      this.error.set('admin.tenants.userForm.errors.required');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    this.tenantApiService.createUserInTenant(this.formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        this.resetForm();
      },
      error: (err) => {
        this.error.set('admin.tenants.userForm.errors.createFailed');
        this.submitting.set(false);
        console.error(err);
      },
    });
  }

  private resetForm(): void {
    this.formData = {
      code: '',
      userName: '',
      fullName: '',
      email: '',
      isActive: true,
      tenantDatabaseName: '',
    };
  }
}
