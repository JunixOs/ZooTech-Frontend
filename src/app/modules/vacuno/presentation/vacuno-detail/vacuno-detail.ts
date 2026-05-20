import {
  Component,
  input,
  output,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VacunoService } from '../../application/services/vacuno.service';
import { VacunoDetalle } from '../../domain/models/vacuno.model';

@Component({
  selector: 'app-vacuno-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vacuno-detail.html',
  styleUrl: './vacuno-detail.scss',
})
export class VacunoDetailComponent {
  // ── Inputs / Outputs ──────────────────────────────────────────────────────
  readonly vacuno = input<VacunoDetalle | null>(null);
  readonly onVolver = output<void>();
  readonly onEditar = output<VacunoDetalle>();
  readonly onEliminado = output<number>();

  // ── Inyecciones ───────────────────────────────────────────────────────────
  private readonly svc = inject(VacunoService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Estado UI ─────────────────────────────────────────────────────────────
  readonly modalEliminarAbierto = signal(false);
  readonly razonEliminacion = signal('');
  readonly eliminando = signal(false);
  readonly errorEliminar = signal<string | null>(null);

  // ── Helpers de display ────────────────────────────────────────────────────
  etiquetaAdquisicion(val: string): string {
    return val === 'compra' ? 'Compra' : 'Monta';
  }

  etiquetaSexo(val: string): string {
    return val === 'macho' ? 'Macho' : 'Hembra';
  }

  etiquetaAptoPara(val: string): string {
    const mapa: Record<string, string> = {
      produccion_leche: 'Producción de leche',
      carne: 'Carne',
      reproduccion: 'Reproducción',
    };
    return mapa[val] ?? val;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  formatearFechaHora(fecha: string): string {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  // ── Acciones ──────────────────────────────────────────────────────────────
  editar(): void {
    const v = this.vacuno();
    if (v) this.onEditar.emit(v);
  }

  abrirModalEliminar(): void {
    this.razonEliminacion.set('');
    this.errorEliminar.set(null);
    this.modalEliminarAbierto.set(true);
  }

  cerrarModalEliminar(): void {
    this.modalEliminarAbierto.set(false);
  }

  confirmarEliminar(): void {
    const razon = this.razonEliminacion().trim();
    if (!razon) {
      this.errorEliminar.set('La razón de eliminación es obligatoria.');
      return;
    }

    const v = this.vacuno();
    if (!v) return;

    this.eliminando.set(true);
    this.errorEliminar.set(null);

    this.svc
      .eliminar(v.id, razon)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.eliminando.set(false);
          this.modalEliminarAbierto.set(false);
          this.onEliminado.emit(v.id);
        },
        error: (err) => {
          this.eliminando.set(false);
          const apiErr = err?.error?.error;
          if (apiErr?.code === 'VACUNO_HAS_DEPENDENCIES') {
            this.errorEliminar.set('Este vacuno tiene registros dependientes activos (triajes, incidentes u ordeños) y no puede eliminarse.');
          } else {
            this.errorEliminar.set(apiErr?.message ?? 'Error al eliminar. Intenta de nuevo.');
          }
        },
      });
  }
}
