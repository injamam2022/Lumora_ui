import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { API_URL } from '../../application-const';

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  constructor(private readonly http: HttpClient) {}

  //get all data
  public get<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return this.http
      .get<T>(API_URL + url, { headers: headers })
      .pipe(map((data) => data));
  }

  //post data generic call
  public post<T>(url: string, payload?: unknown): Observable<T> {
    return this.http.post<T>(API_URL + url, payload).pipe(map((data) => data));
  }

  //put data generic call
  public put<T>(url: string, payload?: unknown): Observable<T> {
    return this.http.put<T>(API_URL + url, payload).pipe(map((data) => data));
  }

  //put data generic call
  public patch<T>(url: string, payload?: unknown): Observable<T> {
    return this.http.patch<T>(API_URL + url, payload).pipe(map((data) => data));
  }

  //delete
  //put data generic call
  public delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(API_URL + url);
  }
}
