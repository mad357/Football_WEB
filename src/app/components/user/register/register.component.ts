import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from '../user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.form = formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
      firstName: [null],
      lastName: [null],
    });
  }

  async register(): Promise<void> {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.userService
      .register(
        this.form.controls['login'].value,
        this.form.controls['password'].value,
        this.form.controls['firstName'].value,
        this.form.controls['lastName'].value
      )
      .subscribe({
        next: () => {
          this.snackBar.open($localize`notification.userCreated`, undefined, { duration: 5000 });
          this.router.navigate(['/login']);
        },
        error: (e: any) => {
          this.loading = false;
          this.snackBar.open(e, undefined, {
            duration: 3000,
          });
        },
      });
  }
}
