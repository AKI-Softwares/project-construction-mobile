export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserRole {
  id: number;
  name: string;
}

export interface UserCompany {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  company?: UserCompany;
}

export interface JwtPayload {
  sub: string;
  companyId: number | null;
  isPlatformAdmin: boolean;
  isCompanyAdmin: boolean;
  roleId: number | null;
  permissions: string[];
  mustChangePassword: boolean;
}
