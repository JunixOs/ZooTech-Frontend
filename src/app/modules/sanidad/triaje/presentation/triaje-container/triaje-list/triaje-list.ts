import { ChangeDetectionStrategy, Component, inject, signal, output, OnInit, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Triaje, TriajeVacunoOption } from '@modules/sanidad/triaje/domain/models/triaje.model';
import { TriajeService } from '../../../../services/triaje.service';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DateRange } from '@shared/models/report-config.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'zt-triaje-list',
  imports: [CommonModule, DateRangeFilterComponent,FormsModule],
  templateUrl: './triaje-list.html',
  styleUrl: './triaje-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeList implements OnInit {
  nuevoTriaje = output<void>();
  verTriaje = output<Triaje>();
  recargar = input(0);

  private triajeService = inject(TriajeService);

  triajes = signal<Triaje[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
    totalRegistros = signal(0);
  totalPaginas = signal(0);
  paginaActual = signal(1);
  tamano = signal(10);

filtroFecha = signal('');
filtroCodigo = signal('');
filtroNombre = signal('');
filtroTipoPeso = signal('');
filtroPesoKg = signal<number | undefined>(undefined);


  
    constructor() {
  effect(() => {
    if (this.recargar() > 0) {
      this.loadTriajes();
    }
  });
}
  ngOnInit(): void {
    this.loadTriajes();
  }

  buscar(): void {
  this.paginaActual.set(1);
  this.loadTriajes();
}
loadTriajes(): void {
  this.loading.set(true);
  this.triajeService.getAll(this.paginaActual(), this.tamano(), {
    fecha: this.filtroFecha() || undefined,
    codigo: this.filtroCodigo() || undefined,
    nombre: this.filtroNombre() || undefined,
    tipoPeso: this.filtroTipoPeso() || undefined,
    pesoKg: this.filtroPesoKg(),
  }).subscribe({
    next: (response) => {
      this.triajes.set(response.data);
      this.totalRegistros.set(response.totalRegistros);
      this.totalPaginas.set(response.totalPaginas);
      this.loading.set(false);
    },
    error: () => {
      this.error.set('Error al cargar los triajes');
      this.loading.set(false);
    }
  });
}
    cambiarPagina(pagina: number): void {
    this.paginaActual.set(pagina);
    this.loadTriajes();
  }

  onVerTriaje(triaje: Triaje): void {
  this.verTriaje.emit(triaje);
}
  openNewTriage(): void {
    this.nuevoTriaje.emit();
  }

  onDateRangeChange(range: DateRange): void {
    console.log(range);
  }

}