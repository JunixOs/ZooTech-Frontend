/* 
    Payload requerido por el backend para inicio de sesion
*/
export interface UsuarioLoginResponse {
    token: string;
    userRole: string;
    lifetime: string;
    userUrl: string;
}