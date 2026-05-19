import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';

@Component({
  selector: 'zt-reporte-list',
  imports: [
    TranslatePipe,
    DataTableComponent,
    SearchInputComponent,
    DateRangeFilterComponent,
    PaginatorComponent,
  ],
  templateUrl: './reporte-list.html',
  styleUrl: './reporte-list.scss',
})
export class ReporteList {}
