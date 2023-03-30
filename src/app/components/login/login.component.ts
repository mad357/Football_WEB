import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;

  constructor(
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      public userService: UserService,
      private snackBar: MatSnackBar,
  ) {
    this.form = formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
  });
  }

  ngOnInit() {

  }


  async login(): Promise<void> {
      this.submitted = true;

      if (this.form.invalid) {
          return;
      }

    this.loading = true;
   this.userService.login(this.form.controls.login.value, this.form.controls.password.value)
      .subscribe({
        next: () => {
            this.router.navigate(['/league']);
        },
        error: error => {
            this.snackBar.open('Wrong user or password', null, {
              duration: 3000
            });
        },
    });
    this.loading = false;
  }
}
