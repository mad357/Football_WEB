import { UserService } from '../components/user/user.service';
import { Injectable } from '@angular/core';
import { map, catchError, switchMap } from 'rxjs/operators';
import { EMPTY, from, lastValueFrom, Observable, throwError } from 'rxjs';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpBackend, HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TokenInterceptor implements HttpInterceptor {
  private httpClient: HttpClient;
  constructor(private authService: UserService, httpBackend: HttpBackend) {
    this.httpClient = new HttpClient(httpBackend);
  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.authService.userValue;
    const isLoggedIn = user && user.accessToken != null;
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    if (isLoggedIn && isApiUrl) {
      const isTokenValid = user.tokenExpireDate > new Date();
      if (isTokenValid) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
      } else {
        const isTokenRefreshValid = user.refreshTokenExpireDate > new Date();
        if (isTokenRefreshValid) {
          return this.authService.refreshToken(user.refreshToken, this.httpClient).pipe(
            switchMap(() => {
              return this.intercept(request, next);
            }),
            catchError((e) => {
              this.authService.logout();
              return EMPTY;
            })
          );
        } else {
          this.authService.logout();
        }
      }
    }
    return next.handle(request);
  }
}
