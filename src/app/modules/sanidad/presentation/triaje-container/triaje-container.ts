import { ChangeDetectionStrategy, Component } from '@angular/core';
import {TriajeDetail} from './triaje-detail/triaje-detail'
import { TriajeForm  } from './triaje-form/triaje-form';
import { TriajeList } from './triaje-list/triaje-list';

@Component({
  selector: 'app-triaje-container',
  imports: [TriajeDetail,TriajeForm,TriajeList],
  templateUrl: './triaje-container.html',
  styleUrl: './triaje-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeContainer { }
