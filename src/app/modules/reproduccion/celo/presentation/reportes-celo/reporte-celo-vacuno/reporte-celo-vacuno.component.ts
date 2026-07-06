import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { CeloPorVacunoReportBase } from '../celo-por-vacuno-report/celo-por-vacuno-report.base';

import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';
import { DownloadMenuComponent } from '@shared/components/download-menu/download-menu.component';
import { BackLinkComponent } from '@shared/components/back-link/back-link.component';

@Component({
  selector: 'zt-reporte-celo-vacuno',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    DateRangeFilterComponent,
    DataTableComponent,
    PageHeaderComponent,
    IconButtonComponent,
    DownloadMenuComponent,
    BackLinkComponent,
  ],
  templateUrl: '../celo-por-vacuno-report/celo-por-vacuno-report.html',
  styleUrl: '../celo-por-vacuno-report/celo-por-vacuno-report.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteCeloVacunoComponent extends CeloPorVacunoReportBase {
  readonly pageTitleKey = 'reproduccion.celo.reportes.byCattle.title';
  readonly actionIcon = 'fa-solid fa-magnifying-glass-plus';
  readonly detailRoutePath = '/reproduccion/celo/reportes/reporte-celo-vacuno';
  protected readonly excelExportTitle = 'Reporte de celo por vacuno';
  protected readonly pdfExportTitle = 'Reporte de celo por vacuno';
  protected readonly exportFileNamePrefix = 'reporte-celo-por-vacuno';
}
