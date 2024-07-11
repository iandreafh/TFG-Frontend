import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  ngOnInit() {}

  email: string = '';
  password: string = '';
  emailFocused: boolean = false;
  passwordFocused: boolean = false;
  hide = true;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.access_token) {
          // Redirige al usuario a la página de inicio recargando la página para actualizar los tokens
          this.errorMessage = '';
          window.location.href = "/home";
        } else if (response.message) {
          // Muestra el mensaje de error devuelto por la API
          this.errorMessage = response.message;
        } else {
          // Mensaje de error por defecto si no se recibió una respuesta exitosa
          this.errorMessage = 'Inicio de sesión fallido. Por favor, verifica tus credenciales.';
        }
      },
      error: (error: HttpErrorResponse) => {
        // Verifica el status del error y maneja el mensaje
        console.log(error);

        if (error.error && (error.error.error || error.error.message)) {
          this.errorMessage = error.error.message ? error.error.message : error.error.error;
        } else {
          this.errorMessage = 'Ocurrió un problema al intentar iniciar sesión.';
        }

        // if (error.status === 403) {
        //   this.errorMessage = 'Tu cuenta está inactiva. Por favor, contacta con soporte para más información.';
        // } else if (error.status === 401) {
        //   this.errorMessage = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
        // } else if (error.error && error.error.message) {
        //   // Muestra el mensaje de error devuelto por la API si está disponible
        //   this.errorMessage = error.error.message;
        // } else {
        //   // Mensaje de error genérico en caso de que no haya un mensaje específico
        //   this.errorMessage = 'Ocurrió un problema al intentar iniciar sesión.';
        // }
      }
    });
  }

}
