export interface ApiResponse<T> {
  data: T;
  success: boolean;
  errorMessage: string | null;
}
