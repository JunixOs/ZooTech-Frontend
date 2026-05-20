import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { LecheList } from './leche-list/leche-list';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';

@Component({
  selector: 'zt-leche-container',
  standalone: true,
  imports: [LecheList],
  templateUrl: './leche-container.html',
  styleUrl: './leche-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheContainer implements OnInit {
  private readonly facade = inject(LecheFacade);

  registros = this.facade.registros;
  loading = this.facade.loading;


  ngOnInit(): void {
    this.facade.cargarRegistros();
  }
}
