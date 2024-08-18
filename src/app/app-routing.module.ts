import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes, CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { MyProjectsComponent } from './pages/my-projects/my-projects.component';
import { ProjectBoardComponent } from './pages/project-board/project-board.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { ChatsComponent } from './pages/chats/chats.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';

export function authenticationGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.getAuthStatus().pipe(
      map(status => {
        if (status) {
          return true;
        } else {
          router.navigate(['/login']);
          return false;
        }
      })
    );
  };
}

export function loggedInGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.getAuthStatus().pipe(
      map(status => {
        if (status) {
          router.navigate(['/home']);
          return false;
        } else {
          return true;
        }
      })
    );
  };
}

const routes: Routes = [
  { path: '', component: WelcomeComponent, canActivate: [loggedInGuard()] },
  { path: 'login', component: LoginComponent, canActivate: [loggedInGuard()] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [loggedInGuard()] },
  { path: 'register', component: RegisterComponent, canActivate: [loggedInGuard()] },
  { path: 'home', component: HomeComponent, canActivate: [authenticationGuard()] },
  { path: 'profile', component: ProfileComponent, canActivate: [authenticationGuard()] },
  { path: 'my-projects', component: MyProjectsComponent, canActivate: [authenticationGuard()] },
  { path: 'my-projects/:id', component: ProjectBoardComponent, canActivate: [authenticationGuard()] },
  { path: 'schedule', component: ScheduleComponent, canActivate: [authenticationGuard()] },
  { path: 'chats', component: ChatsComponent, canActivate: [authenticationGuard()] },
  { path: 'admin-panel', component: AdminPanelComponent, canActivate: [authenticationGuard()] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
