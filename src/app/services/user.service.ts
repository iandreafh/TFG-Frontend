import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    return this.http.post(`${this.apiUrl}/usuarios`, formData);
  }

  // Obtener todos los usuarios
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }

  // Obtener un usuario por su ID
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/${id}`);
  }

  // Actualizar un usuario
  updateUser(id: string, userData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, userData);
  }

  // Eliminar o dar de baja un usuario
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }

  // Obtener el perfil del usuario actual
  getCurrentUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/profile`);
  }
}
