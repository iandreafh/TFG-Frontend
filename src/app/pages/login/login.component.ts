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

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  login() {
    // Validar correo electrónico
    if (!this.validateEmail(this.email)) {
      this.errorMessage = "Debe proporcionar un correo electrónico válido.";
      return; // Terminar ejecución
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.access_token) {
          // Redirige al usuario a la página de inicio recargando la página para actualizar los tokens
          this.errorMessage = '';
          this.router.navigate(['/home']);
        } else if (response.message) {
          // Muestra el mensaje de error devuelto por la API
          this.errorMessage = response.message;
        } else {
          // Mensaje de error por defecto si no se recibió una respuesta exitosa
          this.errorMessage = 'Inicio de sesión fallido. Por favor, verifica tus credenciales.';
        }
      },
      error: (error: HttpErrorResponse) => {
        // Muestra el mensaje de error recibido por la API, y uno por defecto si no hay mensaje de error
        if (error.error && (error.error.error || error.error.message)) {
          this.errorMessage = error.error.message ? error.error.message : error.error.error;
        } else {
          this.errorMessage = 'Ocurrió un problema al intentar iniciar sesión.';
        }
      }
    });
  }

}
