import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = environment.apiUrl; // Usar la URL de la API desde el entorno

  constructor(private http: HttpClient) {}

  // Obtener el número de mensajes no leídos para el usuario actual
  getUnreadMessagesCount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mensajes/unread_count`);
  }

  // Obtener el listado de chats del usuario actual con paginación
  getChats(start: number = 0, limit: number = 10): Observable<any> {
    const params = {
      start: start,  // Desplazamiento para la paginación
      limit: limit   // Límite de resultados por página
    };
    return this.http.get<any>(`${this.apiUrl}/mensajes/chats`, { params });
  }

  // Obtener los mensajes de un chat específico con un usuario
  getChatMessages(idUsuario: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mensajes/chats/${idUsuario}`);
  }

  // Crear un nuevo mensaje en un chat
  createMessage(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mensajes`, data);
  }

  // Crear un comunicado (mensaje global para todos los usuarios)
  createGlobalMessage(data: any): Observable<any> {
    const globalMessageData = { ...data, comunicado: true };  // Añadir el flag de comunicado
    return this.http.post<any>(`${this.apiUrl}/mensajes`, globalMessageData);
  }
}
