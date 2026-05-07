import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private currentTenant = signal<string | null>(null);

  setTenant(tenantId: string) {
    this.currentTenant.set(tenantId);
  }

  getTenantId() {
    return this.currentTenant();
  }
}
