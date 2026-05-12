import { CommonModule } from '@angular/common';
import { Component, Input, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { signal, computed } from '@angular/core';
import { MilkProduction } from '@modules/milkproductions/domain/entities/milk-production.entity';
import { MilkProductionService } from '@modules/milkproductions/application/services/milk-production.service';

@Component({
  selector: 'zt-list.component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  // private ordenoService = inject(OrdenoService);

  // -------------------------------------------------------
  // Estado vinculado al servicio (Application Layer)
  // -------------------------------------------------------
  @Input() titulo: string = '';

  datos = signal<Registro[]>([]);
  cargando = signal(false);

  fechaInicial = signal('');
  fechaFinal = signal('');
  buscar = signal('');
  filasPorPagina = signal(10);
  paginaActual = signal(1);

  filtros = signal({ fecha: '', hora: '', nombre: '', codigo: '', litros: '' });

  opcionesFilas = [5, 10, 25, 50];

  // -------------------------------------------------------
  // Computed: filtrado automático al cambiar cualquier signal
  // -------------------------------------------------------
  registrosFiltrados = computed(() => {
    const txt = this.buscar().toLowerCase().trim();
    const f = this.filtros();

    return this.datos().filter((r) => {
      const globalOk =
        !txt ||
        r.fecha.includes(txt) ||
        r.hora.toLowerCase().includes(txt) ||
        r.nombre.toLowerCase().includes(txt) ||
        r.codigo.toLowerCase().includes(txt) ||
        r.litros.includes(txt);

      const colOk =
        (!f.fecha || r.fecha.includes(f.fecha)) &&
        (!f.hora || r.hora.toLowerCase().includes(f.hora.toLowerCase())) &&
        (!f.nombre || r.nombre.toLowerCase().includes(f.nombre.toLowerCase())) &&
        (!f.codigo || r.codigo.toLowerCase().includes(f.codigo.toLowerCase())) &&
        (!f.litros || r.litros.includes(f.litros));

      return globalOk && colOk;
    });
  });

  totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.registrosFiltrados().length / this.filasPorPagina())),
  );

  inicio = computed(() => (this.paginaActual() - 1) * this.filasPorPagina());

  fin = computed(() =>
    Math.min(this.inicio() + this.filasPorPagina(), this.registrosFiltrados().length),
  );

  filasMostradas = computed(() =>
    this.registrosFiltrados().slice(this.inicio(), this.inicio() + this.filasPorPagina()),
  );

  paginasVisibles = computed(() => {
    const p = this.paginaActual();
    const total = this.totalPaginas();
    const pages: number[] = [];
    for (let i = Math.max(1, p - 1); i <= Math.min(total, p + 1); i++) pages.push(i);
    return pages;
  });

  // -------------------------------------------------------
  // Ciclo de vida
  // -------------------------------------------------------
  ngOnInit(): void {
    this.cargarDatos();
  }

  // -------------------------------------------------------
  // Carga de datos
  // -------------------------------------------------------
  cargarDatos(): void {
    this.milkProductionService.loadProductions();
  }

  // -------------------------------------------------------
  // Paginación
  // -------------------------------------------------------
  irPagina(p: number): void {
    this.paginaActual.set(Math.max(1, Math.min(p, this.totalPaginas())));
  }

  onFilasPorPaginaChange(valor: number): void {
    this.filasPorPagina.set(Number(valor));
    this.paginaActual.set(1);
  }

  // -------------------------------------------------------
  // Filtros por columna
  // -------------------------------------------------------
  setFiltroCol(col: 'fecha' | 'hora' | 'nombre' | 'codigo' | 'litros', valor: string): void {
    this.filtros.update((f) => ({ ...f, [col]: valor }));
    this.paginaActual.set(1);
  }

  onBuscarChange(valor: string): void {
    this.buscar.set(valor);
    this.paginaActual.set(1);
  }

  // -------------------------------------------------------
  // Acciones
  // -------------------------------------------------------
  agregar(): void {
    // TODO: this.router.navigate(['/produccion-leche/agregar']);
  }

  verDetalle(registro: MilkProduction): void {
    // TODO: this.router.navigate(['/produccion-leche', registro.codigo]);
    console.log('Ver detalle:', registro);
  }

  buscarPorFecha(): void {
    this.paginaActual.set(1);
    this.cargarDatos();
  }
}

