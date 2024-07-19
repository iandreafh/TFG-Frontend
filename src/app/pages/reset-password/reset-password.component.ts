import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {

  email: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  resetPassword() {
    this.authService.resetPassword(this.email).subscribe({
      next: (response) => {
        if (response.message) {
          // Muestra el mensaje devuelto por la API
          this.errorMessage = response.message;
          // Tras 10 segundos se redirige al usuario al login
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 10000);
        } else {
          // Mensaje de error por defecto si no se recibió una respuesta exitosa
          this.errorMessage = 'Restauración de contraseña fallida. Por favor, verifica tus credenciales.';
        }
      },
      error: (error: HttpErrorResponse) => {
        // Muestra el mensaje de error recibido por la API, y uno por defecto si no hay mensaje de error
        if (error.error && (error.error.error || error.error.message)) {
          this.errorMessage = error.error.message ? error.error.message : error.error.error;
        } else {
          this.errorMessage = 'Ocurrió un problema al intentar restaurar la contraseña.';
        }
      }
    });
  }

}
