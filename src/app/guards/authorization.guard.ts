import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../components/user/user.service';

@Injectable({ providedIn: 'root' })
export class AuthorizationGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService, private snackBar: MatSnackBar) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = this.userService.userValue;
    if (user) {
      if (user.roles.filter((role) => route.data['roles'].includes(role))) {
        return true;
      } else {
        return false;
      }
    }

    this.snackBar.open('User is not logged in', undefined, {
      duration: 5000,
    });
    this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
    return true;
  }
}
