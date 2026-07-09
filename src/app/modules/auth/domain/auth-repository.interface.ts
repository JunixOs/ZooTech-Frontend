import { Observable } from 'rxjs';

export abstract class AuthRepository {
  abstract login(email: string, password: string, hostname?: string): Observable<string>;
  abstract logout(): Observable<void>;
}
