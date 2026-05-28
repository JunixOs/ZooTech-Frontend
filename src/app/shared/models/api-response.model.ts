/**
 * Envoltorio genérico de respuesta del backend.
 * Todas las respuestas HTTP siguen esta estructura.
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  errorMessage: string | null;
}

/**
 * Valida que la respuesta del backend sea exitosa.
 * Si `success` es `false`, lanza un error con el mensaje del servidor.
 *
 * Uso: `.pipe(map(validateApiResponse), map(r => r.data))`
 *
 * SRP: Esta función tiene UNA responsabilidad: validar el contrato de la API.
 */
export function validateApiResponse<T>(response: ApiResponse<T>): ApiResponse<T> {
  if (!response.success) {
    throw new Error(response.errorMessage ?? 'La operación no fue exitosa.');
  }
  return response;
}
