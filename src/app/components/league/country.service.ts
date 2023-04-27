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
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Country } from 'src/app/models/country';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  constructor(protected httpClient: HttpClient) {}

  public list(): Observable<Array<Country>> {
    return this.httpClient.request<Array<Country>>('get', `${environment.apiUrl}/country/list`, {});
  }

  public update(country: Country): Observable<Country> {
    return this.httpClient.request<Country>('put', `${environment.apiUrl}/country`, { body: country });
  }

}
