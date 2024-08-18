import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service'; // Ajusta la ruta según la estructura de tu proyecto

export function authenticationGuard(): CanActivateFn {
  return () => {
    const oauthService: AuthService = inject(AuthService);
    
    if (oauthService.getAuthStatus() ) {
      return true;
    }
    return false;
  };
}