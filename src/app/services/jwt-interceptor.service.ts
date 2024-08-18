import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Intenta recuperar el token de localStorage
        let accessToken = localStorage.getItem('access_token');

        if (accessToken) {
            try {
                // Intenta parsear el token si está en formato JSON
                const parsedToken = JSON.parse(accessToken);
                accessToken = parsedToken.token;
            } catch (e) {
                // Maneja cualquier error que ocurra durante el parseo del token
                console.error('Error parsing access token', e);
                accessToken = null;
            }
        }

        // Si se ha obtenido un token válido, clona la solicitud y añade el header de autorización
        if (accessToken) {
            request = request.clone({
                setHeaders: { 
                    Authorization: `Bearer ${accessToken}`
                }
            });
        }

        // Pasa la solicitud (original o modificada) al siguiente handler en la cadena
        return next.handle(request);
    }
}
