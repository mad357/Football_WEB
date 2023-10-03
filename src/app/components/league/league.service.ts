import { LeagueFilter } from './league.component';
import { Inject, Injectable, Optional } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
  HttpEvent,
  HttpParameterCodec,
  HttpContext,
} from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { League, SimpleLeague } from 'src/app/models/league';

@Injectable({
  providedIn: 'root',
})
export class LeagueService {
  constructor(protected httpClient: HttpClient) {}

  public list(filter?: any): Observable<League[]> {
    return this.httpClient.request<League[]>('get', `${environment.apiUrl}/league/list`, { params: filter });
  }

  public listSimple(filter?: any): Observable<SimpleLeague[]> {
    return this.httpClient.request<SimpleLeague[]>('get', `${environment.apiUrl}/league/list`, { params: filter });
  }

  public update(league: League): Observable<League> {
    return this.httpClient.request<League>('put', `${environment.apiUrl}/league`, { body: league });
  }

  public create(league: League): Observable<HttpResponse<Response>> {
    return this.httpClient.request<Response>('post', `${environment.apiUrl}/league`, {
      body: league,
      observe: 'response',
    });
  }

  public delete(league: League): Observable<League> {
    return this.httpClient.request<League>('delete', `${environment.apiUrl}/league/${league.id}`);
  }

}
