// Represents the backend user response
export interface User {
  _id: string;
  UserCode: string;
  UserName: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  token: string;
}

// Response from login API
export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Used in the NgRx store
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}
