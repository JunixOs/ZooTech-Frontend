export interface AdminUser {
  id: number;
  email: string;
  username: string | null;
  firstName: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
}

export interface CreateAdminUserRequest {
  email: string;
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  metadata?: string;
}

export interface CreateAdminUserResponse {
  email: string;
  userName: string | null;
  firstName: string | null;
}
