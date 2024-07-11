import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  user: any;

  constructor(private authService: AuthService) {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
    });
  }

  isAdmin(): boolean {
    let rol = this.user ? this.user['Rol'] : 'user'
    return rol === "admin";
  }

  onLogout() {
    this.authService.logout(); // Llama al método logout de AuthService
  }
}
