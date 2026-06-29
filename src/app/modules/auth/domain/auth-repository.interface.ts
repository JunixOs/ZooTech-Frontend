import { Observable } from "rxjs";
import { UsuarioLoginResponse } from "./auth.model";

export abstract class AuthRepository {
    abstract login(email: string, password: string): Observable<UsuarioLoginResponse>;
}