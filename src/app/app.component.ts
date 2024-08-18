import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'MiProyectoFrontend';
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService) {
    this.authService.getAuthStatus().subscribe((status) => {
      this.isAuthenticated = status;
    });
  }
}
