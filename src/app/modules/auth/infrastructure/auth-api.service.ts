import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@core/api/api.config';
import { getAppContextFromHostname, getCurrentHostname } from '@core/auth/app-context';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthRepository } from '../domain/auth-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService extends AuthRepository {
  private http = inject(HttpClient);
  private apiUrl = inject(API_BASE_URL);

  login(email: string, password: string, hostname = getCurrentHostname()): Observable<string> {
    const appContext = getAppContextFromHostname(hostname);

    if (appContext === 'unknown') {
      return throwError(() => new Error('errorUnknownAppContext'));
    }

    const endpoint = appContext === 'admin' ? 'admin/login' : 'user/login';
    const body = appContext === 'admin' ? { email, password } : { email };

    return this.http.post(`${this.apiUrl}/auth/${endpoint}`, body, { responseType: 'text' }).pipe(
      catchError((err) => {
        console.error('[AuthApiService] Error al autenticar.');
        return throwError(() => err);
      }),
    );
  }

  getLoginPageInfo(): Observable<null> {
    return this.http.get(`${this.apiUrl}/tenancing/info`, { responseType: 'text' }).pipe(
      map(() => null),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
