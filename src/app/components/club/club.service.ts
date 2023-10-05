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
import { Observable, Subject, Subscription, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Club } from 'src/app/models/club';
import { ClubDeletedEvent, ClubEvent } from './club-event';

@Injectable({
  providedIn: 'root',
})
export class ClubService {
  private eventDataSubject = new Subject<ClubEvent | undefined | null>();
  readonly eventData = this.eventDataSubject.asObservable();

  constructor(protected httpClient: HttpClient) {}

  public findById(id: number): Observable<Club> {
    return this.httpClient.request<Club>('get', `${environment.apiUrl}/club/${id}`, {});
  }

  public list(filter?: any): Observable<Club[]> {
    return this.httpClient.request<Club[]>('get', `${environment.apiUrl}/club/list`, { params: filter });
  }

  public listSize(filter?: any): Observable<number> {
    return this.httpClient.request<number>('get', `${environment.apiUrl}/club/list-size`, { params: filter });
  }

  public update(club: Club): Observable<Club> {
    return this.httpClient.request<Club>('put', `${environment.apiUrl}/club`, { body: club });
  }

  public create(club: Club): Observable<HttpResponse<Response>> {
    return this.httpClient.request<Response>('post', `${environment.apiUrl}/club`, {
      body: club,
      observe: 'response',
    });
  }

  public delete(clubId: number): Observable<Club> {
    return this.httpClient.request<Club>('delete', `${environment.apiUrl}/club/${clubId}`).pipe(
      tap(() => {
        this.eventDataSubject.next(new ClubDeletedEvent());
      })
    );
  }

}
