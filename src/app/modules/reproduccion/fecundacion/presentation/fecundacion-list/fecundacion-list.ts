import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '@env/environment';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { ColumnConfig } from '@shared/models/table-config.model';

interface FecundacionItem {
  id: number;
  codigo: string;
  tipo: string;
  vacunoReceptor: string;
  fechaProcedimiento: string;
  responsable: string;
  resultado: string;
  observaciones: string | null;
}

interface ApiResponse<T> { data: T; success: boolean; errorMessage: string | null; }

@Component({
  selector: 'zt-fecundacion-list',
  standalone: true,
  imports: [DataTableComponent, PageHeaderComponent, RouterLink, TranslatePipe],
  templateUrl: './fecundacion-list.html',
  styleUrl: './fecundacion-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FecundacionList implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly items = signal<FecundacionItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deletedCodigo = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly columns: ColumnConfig[] = [
    { key: 'codigo', headerKey: 'reproduccion.fecundacion.status.columns.codigo', filterable: true },
    { key: 'fechaProcedimiento', headerKey: 'reproduccion.fecundacion.status.columns.fecha', filterable: true },
    { key: 'vacunoReceptor', headerKey: 'reproduccion.fecundacion.status.columns.receptor', filterable: true },
    { key: 'tipo', headerKey: 'reproduccion.fecundacion.status.columns.tipo', filterable: true },
    { key: 'responsable', headerKey: 'reproduccion.fecundacion.status.columns.responsable', filterable: true },
    { key: 'resultado', headerKey: 'reproduccion.fecundacion.status.columns.resultado', filterable: true },
  ];

  readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.items();
    return this.items().filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(term)));
  });

  readonly tableData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize()).map(item => ({
      ...item,
      fechaProcedimiento: this.formatDate(item.fechaProcedimiento),
    })) as Record<string, unknown>[];
  });

  ngOnInit(): void {
    this.deletedCodigo.set(this.route.snapshot.queryParamMap.get('deleted'));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<ApiResponse<FecundacionItem[]>>(`${environment.apiUrl}/api/v1/fecundacion`).subscribe({
      next: response => { this.items.set(response.data); this.loading.set(false); },
      error: () => { this.error.set('reproduccion.fecundacion.status.loadError'); this.loading.set(false); },
    });
  }

  onSearch(value: string): void { this.searchTerm.set(value); this.currentPage.set(1); }
  onPageChange(value: number): void { this.currentPage.set(value); }
  onPageSizeChange(value: number): void { this.pageSize.set(value); this.currentPage.set(1); }

  onViewAction(row: Record<string, unknown>): void {
    const id = Number(row['id']);
    if (!Number.isNaN(id)) {
      void this.router.navigate(['/reproduccion/fecundacion/detalle', id]);
    }
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
}
