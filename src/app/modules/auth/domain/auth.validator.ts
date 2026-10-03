export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

export class AuthValidator {
    static validateRequest(correo: string, password: string): ValidationResult {
        const errors: Record<string , string> = {};

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!correo || !regex.test(correo)) {
            errors['correo'] = 'Debe colocar un correo valido';
        }

        if(!password || password.length > 120) {
            errors['password'] = 'Debe colocar una contraseña de entre 0 y 120 caracteres.';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    } 
}