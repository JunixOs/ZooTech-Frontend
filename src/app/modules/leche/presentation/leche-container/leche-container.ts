import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LecheList } from './leche-list/leche-list';

@Component({
  selector: 'zt-leche-container',
  standalone: true,
  imports: [LecheList],
  templateUrl: './leche-container.html',
  styleUrl: './leche-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheContainer {}
