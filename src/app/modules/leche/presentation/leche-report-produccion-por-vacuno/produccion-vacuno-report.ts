import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DownloadButtonComponent, DownloadFormat } from '@shared/components/download-button/download-button';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { TranslatePipe } from '@ngx-translate/core';
import {
  generateCSV,
  downloadFile,
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
    TranslatePipe,
  ],
  templateUrl: './produccion-vacuno-report.html',
  styleUrls: ['./produccion-vacuno-report.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProduccionVacunoReport extends ProductionVacunoReportBase {
  private readonly route = inject(ActivatedRoute);

  protected readonly detailRoutePath =
    this.route.snapshot.data['detailRoute'] ?? '/leche/reporte/produccion-por-vacuno';

  readonly dateRangeText = computed(() => dateRangeText(this._dateRange()));

  onDownload(format: DownloadFormat): void {
    if (format === 'excel') {
      this.onDownloadExcel();
      return;
    }

    this.onDownloadPdf();
  }

  onDownloadExcel(): void {
    const rows = this.filteredData();
    const headers = ['Código Vacuno', 'Nombre', 'Fecha', 'Litros'];
    const csvContent = generateCSV(rows, headers, (r) => [
      r.codigoVacuno,
      r.nombreVacuno ?? '',
      r.ultimaFecha,
      String(r.litros),
    ]);
    downloadFile(csvContent, 'produccion-por-vacuno.csv', 'text/csv');
  }

  onDownloadPdf(): void {
    this.repository.downloadPdf(buildPdfFilters(this._dateRange())).subscribe((blob) => {
      openPdfBlob(blob);
    });
  }
}
