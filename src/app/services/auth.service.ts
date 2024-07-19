import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment'; // Importar el archivo de entorno

interface LoginResponse {
  access_token?: string;
  usuario?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; // Usar la URL de la API desde el entorno
  private isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());
  private currentUser = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    if (this.hasToken()) {
      this.fetchUserProfile().subscribe();
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { Email: email, Password: password }).pipe(
      map((response) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          this.setAuthStatus(true);
          this.fetchUserProfile().subscribe();
        }
        return response;
      }),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  logout(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers }).pipe(
      tap(() => {
        localStorage.removeItem('access_token');
        this.setAuthStatus(false);
        this.currentUser.next(null);
        this.router.navigate(['/']);
      }),
      catchError((error) => {
        localStorage.removeItem('access_token');
        this.setAuthStatus(false);
        this.currentUser.next(null);
        this.router.navigate(['/']);
        return of(null);
      })
    ).subscribe();
  }

  resetPassword(email: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/reset_password`, { Email: email }).pipe(
      map((response) => {
        return response;
      }),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  fetchUserProfile(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    return this.http.get<any>(`${this.apiUrl}/usuarios/profile`, { headers }).pipe(
      tap((user) => this.currentUser.next(user)),
      catchError(this.handleError)
    );
  }

  setAuthStatus(authenticated: boolean): void {
    this.isAuthenticated.next(authenticated);
  }

  getAuthStatus(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser.asObservable();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMsg = {
      status: error.status,
      message: '',
    };

    if (error.error instanceof ErrorEvent) {
      errorMsg.message = `Error: ${error.error.message}`;
    } else {
      errorMsg.message = error.error.message || error.message;
    }

    return throwError(() => errorMsg);
  }
}
