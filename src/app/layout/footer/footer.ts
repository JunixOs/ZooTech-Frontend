import { ChangeDetectionStrategy, Component } from '@angular/core';
<<<<<<< Updated upstream

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer { }
=======
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-footer',
  imports: [TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {}
>>>>>>> Stashed changes
