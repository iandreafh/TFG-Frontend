import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = environment.apiUrl; // Usar la URL de la API desde el entorno

  constructor(private http: HttpClient) {}

  // Obtener todas las reuniones futuras con paginación
  getClosestMeetings(limit: number, offset: number = 0): Observable<any> {
    const params = {
      limit: limit,        // Límite de resultados por página
      start: offset,       // Desplazamiento para la paginación
      closest: true        // Indica que se deben traer solo reuniones futuras
    };
    return this.http.get<any>(`${this.apiUrl}/reuniones`, { params });
  }

  // Listar todas las reuniones con paginación
  getAllMeetings(limit: number, offset: number = 0): Observable<any> {
    const params = {
      limit: limit,        // Límite de resultados por página
      start: offset,       // Desplazamiento para la paginación
      closest: false       // Indica que se deben traer todas las reuniones
    };
    return this.http.get<any>(`${this.apiUrl}/reuniones`, { params });
  }

  // Crear una nueva reunión
  createMeeting(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reuniones`, data);
  }

  // Responder a una reunión
  answerMeeting(id: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reuniones/respuesta/${id}`, data);
  }
  
  // Eliminar una reunión permanentemente
  deleteMeetingPermanently(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reuniones/${id}`);
  }
}
