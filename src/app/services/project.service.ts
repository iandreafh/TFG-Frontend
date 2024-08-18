import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = environment.apiUrl; // Usar la URL de la API desde el entorno

  constructor(private http: HttpClient) {}

  // MÉTODOS PARA EL HOME CON LOS PROYECTOS Y TAREAS MÁS RECIENTES

  // Obtener los proyectos activos más recientes
  getTopActiveProjects(n: number): Observable<any> {
    const params = {
      limit: n,
      check_activo: true,        // Filtrar por proyectos activos
      include_members: true      // Incluir miembros en los detalles del proyecto
    };
    return this.http.get<any>(`${this.apiUrl}/proyectos`, { params });
  }
  
  // Obtener las tareas activas más recientes del usuario
  getTopActiveTask(Idusuario: string, limit: number, offset: number = 0): Observable<any> {
    const params = {
      limit: limit,
      start: offset,
      Idusuario: Idusuario       // Filtrar por el ID del usuario
    };
    return this.http.get<any>(`${this.apiUrl}/tareas_usuario`, { params });
  }

  // CRUD DE PROYECTOS

  // Listar todos los proyectos con paginación y ordenamiento opcional
  getAllProjects(start: number = 0, limit: number = 10, sortBy: string = '', sortDirection: 'asc' | 'desc' = 'desc'): Observable<any> {
    const params: any = {
      start: start,
      limit: limit,
      include_members: false,    // No incluir miembros por defecto
      complete: true             // Incluir solo proyectos completos
    };
    if (sortBy != '') {
      params.sort_by = sortBy;
      params.sort_direction = sortDirection;
    }
    return this.http.get<any>(`${this.apiUrl}/proyectos`, { params });
  }

  // Listar proyectos del usuario actual con paginación
  getMyProjects(start: number = 0, limit: number = 10, check_activo: boolean = true, include_members: boolean = true): Observable<any> {
    const params = {
      start: start,
      limit: limit,
      include_members: include_members
    };
    return this.http.get<any>(`${this.apiUrl}/proyectos`, { params });
  }

  // Leer los detalles de un proyecto por su ID
  getProjectById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos/${id}`);
  }

  // Crear un nuevo proyecto
  createProject(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/proyectos`, data);
  }

  // Actualizar un proyecto existente por su ID
  updateProject(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/proyectos/${id}`, data);
  }

  // Dar de baja un proyecto (no eliminar permanentemente)
  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/proyectos/${id}`);
  }
  
  // Eliminar un proyecto de manera permanente
  deleteProjectPermanently(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/proyectos/${id}?permanently=true`);
  }

  // CRUD DE TAREAS

  // Listar tareas de un proyecto con paginación
  getProjectTasks(id_proyecto: string, start: number = 0, limit: number = 40, idUsuario?: string): Observable<any> {
    const params: any = {
      limit: limit,
      start: start,
    };

    if (idUsuario) {
      params.Idusuario = idUsuario;  // Filtrar por el ID del usuario si se proporciona
    }

    return this.http.get<any>(`${this.apiUrl}/proyectos/${id_proyecto}/tareas`, { params });
  }

  // Leer los detalles de una tarea específica por su ID
  getTaskById(id_proyecto: string, id_tarea: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos/${id_proyecto}/tareas/${id_tarea}`);
  }

  // Crear una nueva tarea en un proyecto específico
  createTask(id_proyecto: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/proyectos/${id_proyecto}/tareas`, data);
  }

  // Actualizar una tarea existente por su ID
  updateTask(id_proyecto: string, id_tarea: string, task: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/proyectos/${id_proyecto}/tareas/${id_tarea}`, task);
  }

  // Eliminar una tarea de un proyecto
  deleteTask(id_proyecto: string, id_tarea: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/proyectos/${id_proyecto}/tareas/${id_tarea}`);
  }

  // CRUD DE COMENTARIOS

  // Listar todos los comentarios de un proyecto
  getProjectComments(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/proyectos/${id}/comentarios`);
  }

  // Crear un comentario en un proyecto específico
  createComment(id_proyecto: string, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/proyectos/${id_proyecto}/comentarios`, formData);
  }
}
