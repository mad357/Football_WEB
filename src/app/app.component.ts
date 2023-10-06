import { UserService } from './components/user/user.service';
import { Component } from '@angular/core';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  user?: User;

  constructor(private userService: UserService) {
    this.userService.userObservable?.subscribe((x) =>
      x != null ? (this.user = Object.assign(new User(), x)) : (this.user = undefined)
    );
  }

  logout() {
    this.userService.logout();
  }

  isLogged(): boolean {
    return this.user != undefined;
  }
}
