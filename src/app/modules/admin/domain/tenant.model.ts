export interface TenantAddress {
  country: string;
  state: string;
  province: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
}

export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}

export interface TenantDatabaseConnection {
  isActive: boolean;
}

export interface CreateTenantRequest {
  code: string;
  subDomain: string;
  displayName: string;
  legalName: string;
  email: string;
  phone: string;
  tenantAddress: TenantAddress;
  tenantBranding: TenantBranding;
  tenantDatabaseConnection: TenantDatabaseConnection;
  timeZone: string;
}

export interface CreateTenantResponse {
  code: string;
  subDomain: string;
  displayName: string;
  legalName: string;
}

export interface CreateUserInTenantRequest {
  code: string;
  userName: string;
  fullName: string;
  email: string;
  isActive: boolean;
  tenantDatabaseName: string;
}

export interface CreateUserInTenantResponse {
  email: string;
  userName: string | null;
  fullName: string | null;
}
