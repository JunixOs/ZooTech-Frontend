import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import {
  DownloadButtonComponent,
  DownloadFormat,
} from '@shared/components/download-button/download-button';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingDownloadService } from '@shared/services/loading-download.service';
import {
  openPdfBlob,
  buildPdfFilters,
  dateRangeText,
} from '../leche-report/leche-report.utils';
import { ProductionVacunoReportBase } from '../production-vacuno-report.base';

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
  private readonly loadingDownloadService = inject(LoadingDownloadService);

  protected readonly detailRoutePath =
    this.route.snapshot.data['detailRoute'] ?? '/leche/reporte/produccion-por-vacuno';

  readonly dateRangeText = computed(() =>
    dateRangeText(
      this._dateRange(),
      this.translate.instant('leche.reportes.common.from'),
      this.translate.instant('leche.reportes.common.to'),
    ),
  );

  async onDownload(format: DownloadFormat): Promise<void> {
    try {
      this.loadingDownloadService.show();
      const filtros = buildPdfFilters(this._dateRange());

      if (format === 'pdf') {
        const blob = await firstValueFrom(this.repository.downloadPdf(filtros));
        openPdfBlob(blob);
        return;
      }

      const blob = await firstValueFrom(this.repository.downloadExcel(filtros));
      const url = window.URL.createObjectURL(blob);

      Object.assign(document.createElement('a'), {
        href: url,
        download: `produccion-por-vacuno-${Date.now()}.xlsx`,
      }).click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error al descargar formato ${format}:`, err);
    } finally {
      this.loadingDownloadService.hide();
    }
  }
}
