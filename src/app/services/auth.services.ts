import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { AuthResponse, User } from "../model/auth.model";
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from "../shared/config.service";



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  login(credentials: { userName: string; password: string }): Observable<AuthResponse> {
    return this.http.post<any>(this.config.getCostingUrl('login'), credentials).pipe(
      map(response => ({
        user: response.user,
        accessToken: response.token
      })),
      catchError(this.handleError)
    );
  }

  // 🔹 Forgot Password
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      this.config.getCostingUrl('forgotPassword'),
      { emailId: email }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // 🔹 Verify OTP
  verifyOtp(email: string, otp: string): Observable<AuthResponse> {
    return this.http.post<any>(
      this.config.getCostingUrl('verifyOtp'),
      { emailId: email, otp }
    ).pipe(
      map(response => ({
        user: response.user,
        accessToken: response.token
      })),
      catchError(this.handleError)
    );
  }


  private handleError(error: any): Observable<never> {
    console.error('AuthService Error:', error);
    let errorMessage = 'An unknown error occurred during authentication.';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      errorMessage = `Server error: ${error.status}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  formatUser(data: AuthResponse): User {
    const roleName = data.user.userName || 'unknown';
    return {
      _id: data.user._id,
      UserCode: data.user.UserCode,
      UserName: data.user.UserName,
      userName: data.user.userName,
      createdAt: data.user.createdAt,
      updatedAt: data.user.updatedAt,
      token: data.accessToken,
      role: data.user.role
    };
  }

  setUserInSessionStorage(user: User): void {
    sessionStorage.setItem('userData', JSON.stringify(user));
  }

  logout(): void {
    sessionStorage.removeItem('userData');
  }
}