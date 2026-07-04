import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { switchMap } from 'rxjs';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { TriajeForm } from './triaje-form/triaje-form';
import { TriajeList } from './triaje-list/triaje-list';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import {
  Triaje,
  RegistrarTriajePayload,
  TriajeHistorialItem,
  ActualizarTriajePayload,
} from '@modules/sanidad/domain/models/triaje.model';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { ToastService } from '@core/notifications/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { DateRange } from '@shared/models/report-config.model';

@Component({
  selector: 'zt-triaje-container',
  imports: [ModalComponent, TriajeForm, TriajeList, PageHeaderComponent],
  templateUrl: './triaje-container.html',
  styleUrl: './triaje-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeContainer implements  OnInit {
  protected readonly facade = inject(TriajeFacade);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  showNewTriage = signal(false);
  readonly tiposPeso = this.facade.tiposPeso;
  readonly vacunos = this.facade.vacunos;
  historial = signal<TriajeHistorialItem[]>([]);
  showViewTriage = signal(false);
   selectedTriaje = signal<Triaje | null>(null);

  ngOnInit(): void {
    this.facade.actualizarFiltros({});
    this.facade.cargarCatalogos();
    this.facade.cargarPagina(1);
  }

  onPageChange(page: number): void {
    this.facade.cargarPagina(page);
  }

  onPageSizeChange(size: number): void {
    this.facade.cambiarLimite(size);
  }

  onSearch(q: string): void {
    this.facade.actualizarBusqueda(q);
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.facade.actualizarFiltros(filters);
  }

  onDateRangeChange(range: DateRange): void {
    this.facade.actualizarFiltros({
      ...(range.start ? { fechaInicio: range.start.toISOString() } : {}),
      ...(range.end ? { fechaFin: range.end.toISOString() } : {}),
    });
  }

  openNewTriage(): void {    
    this.showNewTriage.set(true);
    this.historial.set([]);
  }

  closeNewTriage(): void {
    this.showNewTriage.set(false);
  }

  onVacunoChange(vacunoId: number): void {
    this.facade.getHistorialByVacunoId(vacunoId).subscribe({
      next: (h) => this.historial.set(h),
      error: () => this.historial.set([]),
    });
  }

  openViewTriage(triaje: Triaje): void {
    this.facade
      .getById(triaje.id)
      .pipe(
        switchMap((data) => {
          this.selectedTriaje.set(data);
          return this.facade.getHistorialByVacunoId(data.vacunoId);
        }),
      )
      .subscribe({
        next: (historial) => {
          this.historial.set(historial);
          this.showViewTriage.set(true);
        },
        error: () => {
          this.toastService.error(this.translate.instant('sanidad.triaje.mensajes.cargaError'));
        },
      });
  }

  closeViewTriage(): void {
    this.showViewTriage.set(false);
    this.selectedTriaje.set(null);
    this.historial.set([]);
  }

  onTriajeSaved(payload: RegistrarTriajePayload): void {
    this.facade.create(payload).subscribe({
      next: () => {
        this.facade.cargarPagina(1);
        this.toastService.success(this.translate.instant('sanidad.triaje.mensajes.registroExito'));
        this.closeNewTriage();
      },
      error: () => {
        this.toastService.error(this.translate.instant('sanidad.triaje.mensajes.registroError'));
      },
    });
  }

  onTriajeEdited(payload: ActualizarTriajePayload): void {
    const triaje = this.selectedTriaje();
    if (!triaje) return;
    this.facade.update(triaje.id, payload).subscribe({
      next: () => {
        this.facade.cargarPagina(1);
        this.toastService.success(
          this.translate.instant('sanidad.triaje.mensajes.actualizadoExito'),
        );
        this.closeViewTriage();
      },
      error: () => {
        this.toastService.error(this.translate.instant('sanidad.triaje.mensajes.actualizadoError'));
      },
    });
  }

  onTriajeDeleted(id: number): void {
    const confirmed = confirm(this.translate.instant('sanidad.triaje.mensajes.confirmarEliminar'));
    if (!confirmed) return;

    this.facade.delete(id, { motivoEliminacion: 'Eliminado desde frontend' }).subscribe({
      next: () => {
        this.facade.cargarPagina(1);
        this.closeViewTriage();
        this.toastService.success(this.translate.instant('sanidad.triaje.mensajes.eliminadoExito'));
      },
      error: () => {
        this.toastService.error(this.translate.instant('sanidad.triaje.mensajes.eliminadoError'));
      },
    });
  }
}
