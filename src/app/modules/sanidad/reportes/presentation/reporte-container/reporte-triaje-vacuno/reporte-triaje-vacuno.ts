import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Triaje } from '@modules/sanidad/triaje/domain/models/triaje.model';
import { TriajeService } from '@modules/sanidad/services/triaje.service';

@Component({
  selector: 'zt-reporte-triaje-vacuno',
  imports: [FormsModule],
  templateUrl: './reporte-triaje-vacuno.html',
  styleUrl: './reporte-triaje-vacuno.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteTriajeVacuno implements OnInit {
  private readonly triajeService = inject(TriajeService);

  triajes = signal<Triaje[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalRegistros = signal(0);
  totalPaginas = signal(0);
  paginaActual = signal(1);
  tamano = signal(10);
  fechaInicio = signal('');
  fechaFin = signal('');

  filtros = signal({
    codigo: '',
    fecha: '',
    hora: '',
    tipoPeso: '',
    pesoKg: '',
  });

  tableData = computed(() =>
    this.triajes().map((t) => ({
      fecha: this.formatDate(t.fechaHora),
      hora: this.formatTime(t.fechaHora),
      codigo: t.codigo,
      tipoPesoCode: t.tipoPesoCode,
      pesoKg: this.formatWeight(t.pesoKg),
      raw: t,
    })),
  );

  paginasVisibles = computed(() => {
    const total = this.totalPaginas();
    const actual = this.paginaActual();
    const paginas: number[] 
    
    = [];

    for (let page = Math.max(1, actual - 1); page <= Math.min(total, actual + 1); page++) {
      paginas.push(page);
    }

    return paginas.length ? paginas : [1];
  });

  inicio = computed(() =>
    this.totalRegistros() === 0 ? 0 : (this.paginaActual() - 1) * this.tamano() + 1,
  );

  fin = computed(() => Math.min(this.paginaActual() * this.tamano(), this.totalRegistros()));

  ngOnInit(): void {
    this.loadTriajes();
  }

  loadTriajes(): void {
    this.loading.set(true);
    this.error.set(null);

    const f = this.filtros();
    this.triajeService
      .getAll(this.paginaActual(), this.tamano(), {
        fecha: f.fecha || undefined,
        codigo: f.codigo || undefined,
        /*hora: f.hora || undefined,*/
        tipoPeso: f.tipoPeso || undefined,
        pesoKg: f.pesoKg ? Number(f.pesoKg) : undefined,
        fechaInicio: this.fechaInicio() || undefined,
        fechaFin: this.fechaFin() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.triajes.set(response.data);
          this.totalRegistros.set(response.totalRegistros);
          this.totalPaginas.set(response.totalPaginas);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar los triajes');
          this.loading.set(false);
        },
      });
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas() || pagina === this.paginaActual()) {
      return;
    }

    this.paginaActual.set(pagina);
    this.loadTriajes();
  }

  onPageSizeChange(size: number): void {
    this.tamano.set(size);
    this.paginaActual.set(1);
    this.loadTriajes();
  }

  setFiltroColumna(
    columna: 'codigo' | 'fecha' | 'hora' | 'tipoPeso' | 'pesoKg',
    valor: string,
  ): void {
    this.filtros.update((f) => ({ ...f, [columna]: valor }));
    this.paginaActual.set(1);
    this.loadTriajes();
  }

  onDateRangeChange(): void {
    this.paginaActual.set(1);
    this.loadTriajes();
  }

  private formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private formatTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  private formatWeight(value: number): string {
    return value.toLocaleString('es-PE', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  }
}
