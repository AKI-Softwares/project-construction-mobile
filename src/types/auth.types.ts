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

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
