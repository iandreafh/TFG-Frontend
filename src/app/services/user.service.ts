import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Importar el archivo de entorno

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.apiUrl; // Usar la URL de la API desde el entorno

  constructor(private http: HttpClient) { }

  // Crear un nuevo usuario
  createUser(formData: FormData): Observable<any> {
    console.log(formData); // Registro para depuración
    return this.http.post(`${this.apiUrl}/usuarios`, formData);
  }

  // Obtener todos los usuarios con paginación y ordenamiento opcional
  getAllUsers(start: number = 0, limit: number = 10, sortBy: string = '', sortDirection: 'asc' | 'desc' = 'desc'): Observable<any[]> {
    const params: any = { 
      start: start, 
      limit: limit
    };
    if (sortBy != '') {
      params.sort_by = sortBy;
      params.sort_direction = sortDirection;
    }
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`, { params });
  }

  // Obtener un usuario por su ID
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/${id}`);
  }

  // Actualizar un usuario existente
  updateUser(id: string, userData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, userData);
  }

  // Dar de baja un usuario (no elimina permanentemente)
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }

  // Eliminar un usuario permanentemente
  deleteUserPermanently(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}?permanently=true`);
  }

  // Obtener el perfil del usuario actual
  getCurrentUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/profile`);
  }
}
