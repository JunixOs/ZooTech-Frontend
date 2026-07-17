import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReporteFiltroService {
  private readonly hoy = new Date();
  private readonly hace30Dias = this.restarDias(this.hoy, 30);

  readonly fechaDesde = signal<string>(this.toDateOnlyString(this.hace30Dias));
  readonly fechaHasta = signal<string>(this.toDateOnlyString(this.hoy));

  actualizarRango(desde: string, hasta: string): void {
    this.fechaDesde.set(desde);
    this.fechaHasta.set(hasta);
  }
    resetDefault(): void {
  this.fechaDesde.set(this.toDateOnlyString(this.hace30Dias));
  this.fechaHasta.set(this.toDateOnlyString(this.hoy));
}

  private restarDias(fecha: Date, dias: number): Date {
    const resultado = new Date(fecha);
    resultado.setDate(resultado.getDate() - dias);
    return resultado;
  }

  private toDateOnlyString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}