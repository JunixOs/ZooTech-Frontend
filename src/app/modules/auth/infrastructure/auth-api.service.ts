import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_BASE_URL } from "@core/api/api.config";
import { AuthRepository } from "../domain/auth-repository.interface";
import { ApiResponse, validateApiResponse } from "@shared/models/api-response.model";
import { catchError, map, Observable, throwError } from "rxjs";
import { UsuarioLoginResponse } from "../domain/auth.model";

@Injectable({
    providedIn: 'root'
})
export class AuthApiService extends AuthRepository {
    private http = inject(HttpClient);
    private apiUrl = inject(API_BASE_URL);

    login(email: string, password: string): Observable<UsuarioLoginResponse> {
        return this.http.post<ApiResponse<UsuarioLoginResponse>>(
            `${this.apiUrl}/auth/login`,
            {
                email,
                password,
            }
        ).pipe(
            map(validateApiResponse),
            map((response) => response.data),
            catchError((err) => {
                console.error('[AuthApiService] Error al autenticar.')
                return throwError(() => err);
            })
        );
    }

    getLoginPageInfo(): Observable<null> {
        return this.http.get<ApiResponse<null>>(
            `${this.apiUrl}/tenancing/info`
        ).pipe(
            map((response) => response.data),
            catchError((err) => {
                return throwError(() => err);
            })
        )
    }
}