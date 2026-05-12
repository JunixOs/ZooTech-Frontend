import { Routes } from '@angular/router';

export const MILK_PRODUCTIONS_ROUTES: Routes = [
  {
    path: 'agregar',
    loadComponent: () =>
      import('./presentation/agregar-milk/agregar-milk').then((m) => m.AgregarMilk),
  },
];
