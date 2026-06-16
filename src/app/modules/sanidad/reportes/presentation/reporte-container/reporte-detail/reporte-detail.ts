import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { TriajeService } from '@modules/sanidad/services/triaje.service';
import { TriajeVacunoOption, TriajeHistorialItem } from '@modules/sanidad/triaje/domain/models/triaje.model';
import { DateRange } from '@shared/models/report-config.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'zt-reporte-detail',
  imports: [DatePipe, TranslatePipe, FormsModule],
  templateUrl: './reporte-detail.html',
  styleUrl: './reporte-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesDetail {
  private readonly triajeService = inject(TriajeService);

  readonly dateRange = input<DateRange>();
  readonly volver = output<void>();

  vacunosList = signal<TriajeVacunoOption[]>([]);
  selectedVacunoId = signal<number | null>(null);
  historial = signal<TriajeHistorialItem[]>([]);
  loading = signal(false);

  constructor() {
    this.triajeService.getVacunos().subscribe((data) => this.vacunosList.set(data));

    effect(() => {
      const id = this.selectedVacunoId();
      const range = this.dateRange();
      if (id) {
        this.loading.set(true);
        const start = range?.start ? this.toISODate(range.start) : undefined;
        const end = range?.end ? this.toISODate(range.end) : undefined;
        this.triajeService.getHistorialByVacunoId(id, start, end).subscribe({
          next: (data) => {
            this.historial.set(data);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      } else {
        this.historial.set([]);
      }
    });
  }

  private toISODate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  goBack(): void {
    this.volver.emit();
  }
}
