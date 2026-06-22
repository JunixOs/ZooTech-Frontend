import { Observable } from "rxjs";

export abstract class AuthRepository {
    abstract login(email: string, password: string): Observable<string>;
}