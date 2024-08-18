import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment'; // Importar el archivo de entorno para obtener la URL de la API

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
  private isAuthenticated = new BehaviorSubject<boolean>(this.hasToken()); // Maneja el estado de autenticación
  private currentUser = new BehaviorSubject<any>(null); // Almacena los datos del usuario actualmente autenticado

  constructor(private http: HttpClient, private router: Router) {
    if (this.hasToken()) {
      // Si hay un token almacenado, intenta obtener el perfil del usuario
      this.fetchUserProfile().subscribe();
    }
  }

  // Almacena el token en el localStorage junto con la hora de expiración
  private setSession(token: string, hours: number) {
    const now = new Date();
    const expiryTime = now.getTime() + hours * 60 * 60 * 1000; // Tiempo de expiración en milisegundos
    const sessionData = {
      token: token,
      expiry: expiryTime
    };
    localStorage.setItem('access_token', JSON.stringify(sessionData));
  }

  // Obtiene el token del localStorage y verifica su validez
  private getToken(): string | null {
    const sessionData = localStorage.getItem('access_token');
    if (!sessionData) {
      return null;
    }

    const parsedData = JSON.parse(sessionData);
    const now = new Date();

    // Si el token ha expirado, se elimina y se desautentica al usuario
    if (now.getTime() > parsedData.expiry) {
      localStorage.removeItem('access_token');
      this.setAuthStatus(false);
      this.logout();
      this.currentUser.next(null);
      return null;
    }

    return parsedData.token;
  }

  // Maneja el proceso de login y guarda el token si es exitoso
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { Email: email, Password: password }).pipe(
      map((response) => {
        if (response.access_token) {
          this.setSession(response.access_token, 8); // Almacena el token por 8 horas
          this.setAuthStatus(true); // Marca al usuario como autenticado
          this.fetchUserProfile().subscribe(); // Carga el perfil del usuario
        }
        return response;
      }),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  // Maneja el proceso de logout y limpia el token almacenado
  logout(): void {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers }).pipe(
        tap(() => {
          localStorage.removeItem('access_token'); // Elimina el token
          this.setAuthStatus(false); // Marca al usuario como no autenticado
          this.currentUser.next(null); // Limpia el perfil del usuario
          this.router.navigate(['/']); // Redirige a la página principal
        }),
        catchError((error) => {
          // En caso de error en el logout, se procede de todas formas a limpiar los datos locales
          localStorage.removeItem('access_token');
          this.setAuthStatus(false);
          this.currentUser.next(null);
          this.router.navigate(['/']);
          return of(null);
        })
      ).subscribe();
    } else {
      // Si no hay token, se limpian los datos locales directamente
      localStorage.removeItem('access_token');
      this.setAuthStatus(false);
      this.currentUser.next(null);
      this.router.navigate(['/']);
    }
  }

  // Maneja la solicitud de restablecimiento de contraseña
  resetPassword(email: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/reset_password`, { Email: email }).pipe(
      map((response) => {
        return response;
      }),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  // Obtiene el perfil del usuario actual utilizando el token almacenado
  fetchUserProfile(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<any>(`${this.apiUrl}/usuarios/profile`, { headers }).pipe(
      tap((user) => this.currentUser.next(user)), // Almacena el perfil del usuario
      catchError(this.handleError)
    );
  }

  // Establece el estado de autenticación
  setAuthStatus(authenticated: boolean): void {
    this.isAuthenticated.next(authenticated);
  }

  // Devuelve un observable del estado de autenticación
  getAuthStatus(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  // Devuelve un observable del perfil del usuario actual
  getCurrentUser(): Observable<any> {
    return this.currentUser.asObservable();
  }

  // Verifica si hay un token almacenado y si es válido
  private hasToken(): boolean {
    return this.getToken() !== null;
  }

  // Maneja los errores HTTP y devuelve un mensaje de error legible
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMsg = {
      status: error.status,
      message: '',
    };

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de la red
      errorMsg.message = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMsg.message = error.error.message || error.message;
    }

    return throwError(() => errorMsg);
  }
}
