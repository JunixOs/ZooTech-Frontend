import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  template: `
    <div class="report-card">
      <div class="report-card__header">
        <h3 class="report-card__title">{{ title | translate }}</h3>
      </div>

      <div class="report-card__body">
        <div class="report-card__icon">
          <i [class]="iconClass"></i>
        </div>
        <p class="report-card__description">{{ description | translate}}</p>
      </div>

      <div class="report-card__footer">
        <button class="report-card__btn" (click)="onAbrir()">Abrir</button>
      </div>
    </div>
  `,
styleUrls: ['./ReportCard.css'],
})
export class ReportCard {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() iconClass: string = '';
  @Input() onOpen: () => void = () => {};

  onAbrir(): void {
    this.onOpen();
  }
}
