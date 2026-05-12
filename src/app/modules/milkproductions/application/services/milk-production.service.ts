import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { MilkProduction } from '../../domain/entities/milk-production.entity';
import { MilkProductionApiService } from '../../infrastructure/api/milk-production.api.service';

@Injectable({
  providedIn: 'root',
})
export class MilkProductionService {
  private apiService = inject(MilkProductionApiService);

  // Estado con Signals para reactividad eficiente y zoneless-ready
  productions = signal<MilkProduction[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  /**
   * Carga todos los registros de producción de leche desde la API
   */
  loadProductions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.productions.set(data);
        },
        error: (err) => {
          console.error('Error loading milk productions:', err);
          this.error.set('No se pudo cargar la producción de leche.');
        },
      });
  }

  /**
   * Registra una nueva producción de leche
   */
  createProduction(data: MilkProduction): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService
      .create(data)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (newProd) => {
          this.productions.update((prods) => [...prods, newProd]);
        },
        error: (err) => {
          console.error('Error creating milk production:', err);
          this.error.set('No se pudo registrar la producción de leche.');
        },
      });
  }
}
