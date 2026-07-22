import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { TenantApiService } from '../../infrastructure/tenant-api.service';
import { CreateTenantRequest } from '../../domain/tenant.model';

@Component({
  selector: 'zt-tenant-form',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './tenant-form.component.html',
  styleUrl: './tenant-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantFormComponent {
  private readonly tenantApiService = inject(TenantApiService);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  formData: CreateTenantRequest = {
    code: '',
    subDomain: '',
    displayName: '',
    legalName: '',
    email: '',
    phone: '',
    timeZone: 'America/Lima',
    tenantAddress: {
      country: '',
      state: '',
      province: '',
      city: '',
      addressLine1: '',
      addressLine2: '',
    },
    tenantBranding: {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      logoUrl: '',
    },
    tenantDatabaseConnection: {
      isActive: true,
    },
  };

  onSubmit(): void {
    if (!this.formData.code || !this.formData.subDomain || !this.formData.displayName) {
      this.error.set('admin.tenants.form.errors.required');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    this.tenantApiService.createTenant(this.formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        this.resetForm();
      },
      error: (err) => {
        this.error.set('admin.tenants.form.errors.createFailed');
        this.submitting.set(false);
        console.error(err);
      },
    });
  }

  private resetForm(): void {
    this.formData = {
      code: '',
      subDomain: '',
      displayName: '',
      legalName: '',
      email: '',
      phone: '',
      timeZone: 'America/Lima',
      tenantAddress: {
        country: '',
        state: '',
        province: '',
        city: '',
        addressLine1: '',
        addressLine2: '',
      },
      tenantBranding: {
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        logoUrl: '',
      },
      tenantDatabaseConnection: {
        isActive: true,
      },
    };
  }
}
