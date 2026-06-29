import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private currentTenantId = signal<string | null>(null);
  private currentTenantName = signal<string | null>(null);
  private currentTenantLegalName = signal<string | null>(null);
  private currentApp = signal<string | null>(null);

  setTenant(tenantId: string, tenantName: string, tenantLegalName: string, currentApp: 'tenant' | 'admin') {
    this.currentTenantId.set(tenantId);
    this.currentTenantName.set(tenantName);
    this.currentTenantLegalName.set(tenantLegalName);
    this.currentApp.set(currentApp);
  }

  getTenantId() {
    return this.currentTenantId();
  }

  getTenantName() {
    return this.currentTenantName();
  }

  getTenantLegalName() {
    return this.currentTenantLegalName();
  }

  getCurrentApp() {
    return this.currentApp();
  }
}
