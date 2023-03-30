import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../components/login/user.service';


@Injectable({ providedIn: 'root' })
export class AuthorizationGuard implements CanActivate {
    constructor(
        private router: Router,
        private userService: UserService,
        private snackBar: MatSnackBar,
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const user = this.userService.userObservable;
        if (user) {
            return true;
        }

        this.snackBar.open('User is not logged in', null, {
          duration: 5000
        });
        this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}
