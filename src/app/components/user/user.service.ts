import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject: BehaviorSubject<User | null>;
  public userObservable: Observable<User | null>;

  constructor(private router: Router, private httpClient: HttpClient) {
    this.userSubject = new BehaviorSubject<User | null>(null);
    this.userObservable = this.userSubject.asObservable();
    let user = JSON.parse(localStorage.getItem('user')!) as User | null;
    if (user) {
      user.tokenExpireDate = new Date(user.tokenExpireDate);
      user.refreshTokenExpireDate = new Date(user.refreshTokenExpireDate);
      this.userSubject.next(user);
    }
  }

  public get userValue(): User | null {
    return this.userSubject.value;
  }

  public register(login: String, password: String, firstName: String, lastName: String): Observable<HttpResponse<Response>> {
    const body = {
      login: login,
      password: password,
      firstName: firstName,
      lastName: lastName,
    }

    return this.httpClient.request<Response>('post', `${environment.apiUrl}/user/register`, {
      body: body,
      observe: 'response',
      // headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  public login(login: String, password: String): Observable<User> {
    const body = {
      login: login,
      password: password,
    };

    return this.httpClient.post(`${environment.apiUrl}/user/login`, body, { responseType: 'text' }).pipe(
      map((response) => {
        localStorage.clear();
        response
          .replace(/["{}]/g, '')
          .split(',')
          .forEach((item) => {
            item.split(':').forEach((pair, index) => {
              if (pair == 'access_token') {
                localStorage.setItem('access_token', item.split(':')[index + 1]);
              } else if (pair == 'refresh_token') {
                localStorage.setItem('refresh_token', item.split(':')[index + 1]);
              }
            });
          });
        var encodedString = this.parseJwt(localStorage.getItem('access_token')!);
        let user = new User();
        user.login = encodedString.login;
        user.roles = encodedString.roles;
        user.accessToken = localStorage.getItem('access_token')!;
        user.refreshToken = localStorage.getItem('refresh_token')!;
        let date = new Date(encodedString.exp * 1000);
        user.tokenExpireDate = date;
        encodedString = this.parseJwt(localStorage.getItem('refresh_token')!);
        date = new Date(encodedString.exp * 1000);
        user.refreshTokenExpireDate = date;
        localStorage.setItem('user', JSON.stringify(user));

        this.userSubject.next(user);

        return user;
      })
    );
  }

  public refreshToken(token: string, httpClient?: HttpClient): Observable<void> {
    if (!httpClient) {
      httpClient = this.httpClient;
    }
    return httpClient
      .post(`${environment.apiUrl}/user/refresh-token`, token, {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'text',
      })
      .pipe(
        map((response) => {
          response
            .replace(/["{}]/g, '')
            .split(',')
            .forEach((item) => {
              item.split(':').forEach((pair, index) => {
                if (pair == 'access_token') {
                  localStorage.setItem('access_token', item.split(':')[index + 1]);
                  var encodedString = this.parseJwt(response);
                  let date = new Date(encodedString.exp * 1000);
                  let user = JSON.parse(localStorage.getItem('user')!) as User;
                  user.tokenExpireDate = date;
                  user.accessToken = localStorage.getItem('access_token')!;
                  user.refreshTokenExpireDate = new Date(user.refreshTokenExpireDate);
                  this.userSubject.next(user);
                  localStorage.setItem('user', JSON.stringify(user));
                }
              });
            });
          return;
        })
      );
  }

  parseJwt(token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  }

  logout() {
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
