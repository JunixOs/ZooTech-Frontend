import { Component } from '@angular/core';
import { ListComponent } from '@shared/ui/list/list.component';

@Component({
  selector: 'zt-agregar-milk',
  standalone: true,
  imports: [ListComponent],
  templateUrl: './agregar-milk.html',
  styleUrl: './agregar-milk.css',
})
export class AgregarMilk {}
