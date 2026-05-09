import { Component } from '@angular/core';
import { ListMilkComponent } from '@shared/ui/list/list-milk.component';

@Component({
  selector: 'zt-agregar-milk',
  standalone: true,
  imports: [ListMilkComponent],
  templateUrl: './agregar-milk.html',
  styleUrl: './agregar-milk.css',
})
export class AgregarMilk {}
