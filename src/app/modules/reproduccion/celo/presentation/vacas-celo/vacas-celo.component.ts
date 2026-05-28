import { ChangeDetectionStrategy, Component, inject, OnInit, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CeloApiService } from '@modules/reproduccion/celo/infrastructure/celo-api.service';
import { RegistrarCeloRequest } from '@modules/reproduccion/celo/domain/models/celo.model';
import { CeloValidator } from '@modules/reproduccion/celo/domain/validators/celo.validator';

interface VacaCelo {
  id: number;
  codigo: string;
  nombre: string;
  diasRestante: number;
  estado: 'En celo' | 'Próximo' | 'Pasó';
  vecesEnCelo: number;
  crias: number;
}

@Component({
  selector: 'zt-vacas-celo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vacas-celo.component.html',
  styleUrl: './vacas-celo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacasCeloComponent implements OnInit {
  private celoApiService = inject(CeloApiService);
  errors = signal<Record<string, string>>({});

  mostrarModalNuevoCelo = false;

  vacas: VacaCelo[] = [
    { id: 1, codigo: 'VAC-001', nombre: 'Clara', diasRestante: 2, estado: 'Próximo', vecesEnCelo: 2, crias: 1 },
    { id: 2, codigo: 'VAC-002', nombre: 'Bella', diasRestante: 0, estado: 'En celo', vecesEnCelo: 4, crias: 2 },
    { id: 3, codigo: 'VAC-003', nombre: 'Rosa', diasRestante: 15, estado: 'Pasó', vecesEnCelo: 3, crias: 0 },
    { id: 4, codigo: 'VAC-004', nombre: 'Daisy', diasRestante: 5, estado: 'Próximo', vecesEnCelo: 1, crias: 0 },
    { id: 5, codigo: 'VAC-005', nombre: 'Luna', diasRestante: 0, estado: 'En celo', vecesEnCelo: 5, crias: 3 }
  ];

  caracteristicas = [
    { code: 'MUGE', nombre: 'Mugido persistente' },
    { code: 'SECRECION', nombre: 'Secreción vulvar' },
    { code: 'INQUIETA', nombre: 'Inquietud / Nerviosismo' },
    { code: 'MONTADA', nombre: 'Se deja montar' },
    { code: 'MONTA_OTRAS', nombre: 'Monta a otras vacas' },
    { code: 'VULVA_INFLAMADA', nombre: 'Vulva inflamada' },
    { code: 'OTROS', nombre: 'Otros' }
  ];

  nuevoCelo = {
    vacunoId: 1,
    fechaHora: '',
    observaciones: '',
    caracteristicaCodes: [] as string[]
  };

  textoBusquedaVacuno = '';
  mostrarDropdownVacunos = false;
  vacasFiltradas: VacaCelo[] = [];

  ngOnInit(): void {
    this.resetNuevoCelo();
  }

  private getLocalDateTimeString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  textoOtraCaracteristica = '';

  resetNuevoCelo(): void {
    this.nuevoCelo = {
      vacunoId: 0,
      fechaHora: this.getLocalDateTimeString(),
      observaciones: '',
      caracteristicaCodes: []
    };
    this.textoBusquedaVacuno = '';
    this.mostrarDropdownVacunos = false;
    this.vacasFiltradas = [...this.vacas];
    this.textoOtraCaracteristica = '';
    this.caracteristicas = [
      { code: 'MUGE', nombre: 'Mugido persistente' },
      { code: 'SECRECION', nombre: 'Secreción vulvar' },
      { code: 'INQUIETA', nombre: 'Inquietud / Nerviosismo' },
      { code: 'MONTADA', nombre: 'Se deja montar' },
      { code: 'MONTA_OTRAS', nombre: 'Monta a otras vacas' },
      { code: 'VULVA_INFLAMADA', nombre: 'Vulva inflamada' },
      { code: 'OTROS', nombre: 'Otros' }
    ];
    this.errors.set({});
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.buscador-vacuno-container')) {
      this.mostrarDropdownVacunos = false;
    }
  }

  onBusquedaVacunoChange(): void {
    const term = this.textoBusquedaVacuno.toLowerCase().trim();
    if (!term) {
      this.vacasFiltradas = [...this.vacas];
    } else {
      this.vacasFiltradas = this.vacas.filter(v =>
        v.codigo.toLowerCase().includes(term) ||
        v.nombre.toLowerCase().includes(term)
      );
    }
    this.mostrarDropdownVacunos = true;
  }

  toggleDropdownVacunos(event: Event): void {
    event.stopPropagation();
    this.mostrarDropdownVacunos = !this.mostrarDropdownVacunos;
    if (this.mostrarDropdownVacunos) {
      this.vacasFiltradas = [...this.vacas];
    }
  }

  seleccionarVacuno(vaca: VacaCelo): void {
    this.nuevoCelo.vacunoId = vaca.id;
    this.textoBusquedaVacuno = `${vaca.codigo} - ${vaca.nombre}`;
    this.mostrarDropdownVacunos = false;
  }

  abrirModalNuevoCelo(): void {
    this.resetNuevoCelo();
    this.mostrarModalNuevoCelo = true;
  }

  cerrarModalNuevoCelo(): void {
    this.mostrarModalNuevoCelo = false;
    this.errors.set({});
  }

  cambiarCaracteristica(code: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      if (!this.nuevoCelo.caracteristicaCodes.includes(code)) {
        this.nuevoCelo.caracteristicaCodes = [...this.nuevoCelo.caracteristicaCodes, code];
      }
    } else {
      this.nuevoCelo.caracteristicaCodes = this.nuevoCelo.caracteristicaCodes.filter(c => c !== code);
    }
  }

  agregarOtraCaracteristica(): void {
    const nombre = this.textoOtraCaracteristica.trim();
    if (!nombre) return;

    const existe = this.caracteristicas.some(c => c.nombre.toLowerCase() === nombre.toLowerCase());
    if (existe) {
      const item = this.caracteristicas.find(c => c.nombre.toLowerCase() === nombre.toLowerCase());
      if (item && !this.nuevoCelo.caracteristicaCodes.includes(item.code)) {
        this.nuevoCelo.caracteristicaCodes = [...this.nuevoCelo.caracteristicaCodes, item.code];
      }
      this.textoOtraCaracteristica = '';
      return;
    }

    const code = 'CUSTOM_' + new Date().getTime();
    this.caracteristicas = [...this.caracteristicas, { code, nombre }];
    this.nuevoCelo.caracteristicaCodes = [...this.nuevoCelo.caracteristicaCodes, code];
    this.textoOtraCaracteristica = '';
  }

  guardarNuevoCelo(): void {
    const requestData: RegistrarCeloRequest = {
      vacunoId: Number(this.nuevoCelo.vacunoId),
      encargadoUsuarioId: 1, // Usuario por defecto Abel Antonio
      fechaHora: this.nuevoCelo.fechaHora,
      observaciones: this.nuevoCelo.observaciones,
      caracteristicaCodes: this.nuevoCelo.caracteristicaCodes
    };

    const validation = CeloValidator.validateRequest(requestData);
    if (!validation.isValid) {
      this.errors.set(validation.errors);
      return;
    }
    this.errors.set({});

    this.celoApiService.registrarCelo(requestData).subscribe({
      next: () => {
        alert('¡Celo registrado con éxito!');
        this.cerrarModalNuevoCelo();
      },
      error: (err) => {
        console.error('Error al registrar celo:', err);
        alert('Error al registrar el celo. Por favor, intente nuevamente.');
      }
    });
  }
}
