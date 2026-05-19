import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-leche-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './leche-form.html',
  styleUrl: './leche-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheForm {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    fecha: string;
    hora: string;
    vaca: string;
    codigo: string;
    litro: number | null;
    observaciones: string;
  }>();

  fecha = '';
  hora = '';
  vaca = '';
  codigo = '';
  litro: number | null = null;
  observaciones = '';
  encargado = '';

  onCancel() {
    this.resetForm();
    this.close.emit();
  }

  onSave() {
    if (!this.fecha || !this.vaca) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    this.save.emit({
      fecha: this.fecha,
      hora: this.hora,
      vaca: this.vaca,
      codigo: this.codigo,
      litro: this.litro,
      observaciones: this.observaciones,
    });
    this.resetForm();
    this.close.emit();
  }

  private resetForm() {
    this.fecha = '';
    this.hora = '';
    this.vaca = '';
    this.codigo = '';
    this.litro = null;
    this.observaciones = '';
  }
}
