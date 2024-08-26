import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'MiProyectoFrontend';
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.hasToken();

    // Suscribirse a cambios en el estado del token
    this.authService.getCurrentUser().subscribe(user => {
      this.isAuthenticated = this.authService.hasToken();

      // Si no hay usuario, redirigir a la página de inicio de sesión
      if (!this.isAuthenticated) {
        this.router.navigate(['/']);
      }
    });
  }
}
