import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-vacas-celo',
  standalone: true,
  imports: [TranslatePipe],
<<<<<<< HEAD:src/app/layout/footer/footer.ts
  templateUrl: './footer.html',
  styleUrl: './footer.css',
=======
  templateUrl: './vacas-celo.component.html',
  styleUrl: './vacas-celo.component.css',
>>>>>>> develop:src/app/modules/reproduccion/celo/presentation/vacas-celo/vacas-celo.component.ts
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacasCeloComponent {}
