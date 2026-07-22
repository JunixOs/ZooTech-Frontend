import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import {
  DownloadButtonComponent,
  DownloadFormat,
} from '@shared/components/download-button/download-button';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import {
  openPdfBlob,
  buildPdfFilters,
  dateRangeText,
} from '../leche-report/leche-report.utils';
import { ProductionVacunoReportBase } from '../production-vacuno-report.base';
import { saveBlob } from '@shared/utils/export-table.util';

@Component({
  selector: 'zt-produccion-vacuno-report',
  standalone: true,
  imports: [
    DataTableComponent,
    DateRangeFilterComponent,
    DownloadButtonComponent,
    PageHeaderComponent,
    DecimalPipe,
    TranslatePipe,
  ],
  templateUrl: './produccion-vacuno-report.html',
  styleUrls: ['./produccion-vacuno-report.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProduccionVacunoReport extends ProductionVacunoReportBase {
  private readonly route = inject(ActivatedRoute);
  readonly downloading = signal(false);

  protected readonly detailRoutePath =
    this.route.snapshot.data['detailRoute'] ?? '/leche/reporte/produccion-por-vacuno';

  readonly dateRangeText = computed(() =>
    dateRangeText(
      this._dateRange(),
      this.translate.instant('leche.reportes.common.from'),
      this.translate.instant('leche.reportes.common.to'),
    ),
  );

  onDownload(format: DownloadFormat): void {
    if (this.downloading()) return;

    if (format === 'excel') {
      this.onDownloadExcel();
      return;
    }

    this.onDownloadPdf();
  }

  onDownloadExcel(): void {
    this.downloading.set(true);
    this.repository
      .downloadExcel(buildPdfFilters(this._dateRange(), { comparativo: false }))
      .pipe(finalize(() => this.downloading.set(false)))
      .subscribe((blob) => {
        saveBlob(blob, 'produccion-por-vacuno.xlsx');
      });
  }

  onDownloadPdf(): void {
    this.downloading.set(true);
    this.repository
      .downloadPdf(buildPdfFilters(this._dateRange()))
      .pipe(finalize(() => this.downloading.set(false)))
      .subscribe((blob) => {
        openPdfBlob(blob);
      });
  }
}
