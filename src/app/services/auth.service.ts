import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface LoginResponse {
  access_token?: string;
  usuario?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUser = new BehaviorSubject<any>(null); // Almacena los datos del usuario actualmente autenticado

  constructor(private http: HttpClient, private router: Router) {
    if (this.hasToken()) {
      this.fetchUserProfile().subscribe();
    }
  }

  private setSession(token: string, hours: number) {
    const now = new Date();
    const expiryTime = now.getTime() + hours * 60 * 60 * 1000; // Tiempo de expiración en milisegundos
    const sessionData = {
      token: token,
      expiry: expiryTime
    };
    localStorage.setItem('access_token', JSON.stringify(sessionData));
  }

  private getToken(): string | null {
    const sessionData = localStorage.getItem('access_token');
    if (!sessionData) {
      return null;
    }

    const parsedData = JSON.parse(sessionData);
    const now = new Date();

    if (now.getTime() > parsedData.expiry) {      
      localStorage.removeItem('access_token');
      this.logout();
      this.currentUser.next(null);
      return null;
    }

    return parsedData.token;
  }

  // Hacer público el método hasToken para que se pueda acceder desde los guards
  public hasToken(): boolean {
    return this.getToken() !== null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { Email: email, Password: password }).pipe(
      map((response) => {
        if (response.access_token) {
          this.setSession(response.access_token, 4); // Almacena el token por 4 horas
          this.fetchUserProfile().subscribe(); // Carga el perfil del usuario
        }
        return response;
      }),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers }).pipe(
        tap(() => {
          localStorage.removeItem('access_token');
          this.currentUser.next(null);
          this.router.navigate(['/']);
        }),
        catchError((error) => {
          localStorage.removeItem('access_token');
          this.currentUser.next(null);
          this.router.navigate(['/']);
          return of(null);
        })
      ).subscribe();
    } else {
      localStorage.removeItem('access_token');
      this.currentUser.next(null);
      this.router.navigate(['/']);
    }
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
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<any>(`${this.apiUrl}/usuarios/profile`, { headers }).pipe(
      tap((user) => this.currentUser.next(user)),
      catchError(this.handleError)
    );
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser.asObservable();
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
