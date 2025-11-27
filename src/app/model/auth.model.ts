import { Role } from "./role.model";

export interface User {
  _id: string;
  UserCode: string;
  UserName: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  token: string;
  role: Role;
  initialScreen?: string; // Optional - comes from permissions, not user data
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface AuthState {
  forgotPassword: any;
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}