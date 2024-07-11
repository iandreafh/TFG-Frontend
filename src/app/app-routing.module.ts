import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes, CanActivateFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RegisterComponent } from './pages/register/register.component';

export function authenticationGuard(): CanActivateFn {
  return () => {
    return inject(AuthService).getAuthStatus().pipe(
      map(status => {
        if (status) {
          // Si el status es true, el usuario está autenticado y puede acceder a la ruta
          return true;
        } else {
          // Si el status es false, el usuario no está autenticado y se redirige al login
          window.location.href = '/login'
          return false;
        }
      })
    );
  };
}

export function loggedInGuard(): CanActivateFn {
  return () => {
    return inject(AuthService).getAuthStatus().pipe(
      map(status => {
        if (status) {
          // Si el status es true, el usuario está autenticado y es redirigido a su página de inicio
          window.location.href = '/home'
          return false;
        } else {
          // Si el status es false, el usuario no está autenticado y puede acceder a la landing page y al login
          return true;
        }
      })
    );
  };
}

const routes: Routes = [
  // ... otras rutas,
  { path: '', component: WelcomeComponent, canActivate: [loggedInGuard()] },
  { path: 'login', component: LoginComponent, canActivate: [loggedInGuard()] },
  { path: 'register', component: RegisterComponent, canActivate: [loggedInGuard()] },
  { path: 'home', component: HomeComponent, canActivate: [authenticationGuard()] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authenticationGuard()] },
  { path: 'profile', component: ProfileComponent, canActivate: [authenticationGuard()] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
