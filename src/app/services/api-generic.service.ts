import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Importar el archivo de entorno

@Injectable({
  providedIn: 'root'
})
export class ApiGenericService {

  private apiUrl = environment.apiUrl; // Usar la URL de la API desde el entorno

  constructor(private http: HttpClient) { }

}
