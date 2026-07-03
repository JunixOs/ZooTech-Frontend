import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TriajeFacade } from '@modules/sanidad/triaje/application/triaje.facade';
import { ReporteTriajePorVacunoList } from './reporte-triaje-por-vacuno-list/reporte-triaje-por-vacuno-list';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
@Component({
  selector: 'zt-reporte-triaje-por-vacuno',
  imports: [ReporteTriajePorVacunoList, PageHeaderComponent],
  templateUrl: './reporte-triaje-por-vacuno.html',
  styleUrl: './reporte-triaje-por-vacuno.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteTriajePorVacuno implements OnInit {
  readonly facade = inject(TriajeFacade);
  readonly #route = inject(ActivatedRoute);
  readonly vacunoId = Number(this.#route.snapshot.paramMap.get('id'));
  readonly titulo = computed(() => {
  const v = this.facade.vacunos().find(v => v.id === this.vacunoId);
  const codigo = v ? v.codigo : '#$(this.vacunoId}';
  return `${codigo}${v ? ` — ${v.nombre}` : ''}`;
});
  expandedIndex = signal<number | null>(null);

  ngOnInit(): void {
    const vacunoId = Number(this.#route.snapshot.paramMap.get('id'));
    if (vacunoId) {
      this.facade.cargarPorVacuno(vacunoId);
      this.facade.cargarCatalogos();
    }
  }

  toggleRow(index: number): void {
    this.expandedIndex.set(this.expandedIndex() === index ? null : index);
  }

  cambiarPagina(pagina: number): void {
    this.facade.cargarPagina(pagina);
  }
  onPageSizeChange(size: number): void {
    this.facade.cambiarLimite(size);
  }
  onSearch(_term: string): void {
    this.facade.cargarPagina(1);
  }
  onColumnFilter(filters: Record<string, string>): void {
    const vacunoId = this.#route.snapshot.paramMap.get('id');
    if (vacunoId) {
      filters['vacunoId'] = vacunoId;
    }
    this.facade.actualizarFiltros(filters);
  }
}
