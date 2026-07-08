import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombre',
})
export class NombrePipe implements PipeTransform {
  transform(value: string | undefined | unknown): string {
    const text = value?.toString().trim();
    if (!text) return 'No espeficado';
    return text.split(' ')[0] + ' ' + text.split(' ')[1];
  }
}
