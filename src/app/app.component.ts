import { UserService } from './components/login/user.service';
import { Component } from '@angular/core';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  user!: User | null;

  constructor(private userService: UserService) {
    this.userService.userObservable?.subscribe((x) => (this.user = x));
  }

  logout() {
    this.userService.logout();
  }
}
