import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FecundacionApiService } from '../../infrastructure/api/fecundacion-api.service';
import { VacunosApiService } from '@modules/vacunos/infrastructure/vacunos.api.service';
import { Vacuno } from '@modules/vacunos/domain/models/vacuno.model';

@Component({
  selector: 'zt-registro-fecundacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './registro-fecundacion.component.html',
  styleUrl: './registro-fecundacion.component.css'
})
export class RegistroFecundacionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private fecundacionApi = inject(FecundacionApiService);
  private vacunosApi = inject(VacunosApiService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  form!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  vacunosReceptores$: Observable<Vacuno[]> = of([]);
  vacunosDonantes$: Observable<Vacuno[]> = of([]);
  
  // For UI display of selected items
  selectedReceptor: Vacuno | null = null;
  selectedDonante: Vacuno | null = null;
  
  // Autocomplete loading states
  isLoadingReceptores = false;
  isLoadingDonantes = false;

  tiposFecundacion = [
    { value: 'MONTA_NATURAL', labelKey: 'reproduccion.fecundacion.registro.form.options.tipos.MONTA_NATURAL' },
    { value: 'INSEMINACION_ARTIFICIAL', labelKey: 'reproduccion.fecundacion.registro.form.options.tipos.INSEMINACION_ARTIFICIAL' },
    { value: 'TRANSFERENCIA_EMBRIONES', labelKey: 'reproduccion.fecundacion.registro.form.options.tipos.TRANSFERENCIA_EMBRIONES' }
  ];

  resultados = [
    { value: 'EXITOSA', labelKey: 'reproduccion.fecundacion.registro.form.options.resultados.EXITOSA' },
    { value: 'FALLIDA', labelKey: 'reproduccion.fecundacion.registro.form.options.resultados.FALLIDA' },
    { value: 'PENDIENTE', labelKey: 'reproduccion.fecundacion.registro.form.options.resultados.PENDIENTE' }
  ];

  ngOnInit() {
    this.buildForm();
    this.setupDynamicValidations();
    this.setupAutocomplete();
  }

  private buildForm() {
    this.form = this.fb.group({
      tipoFecundacionCode: ['', Validators.required],
      vacunoReceptorId: [null, Validators.required],
      vacunoReceptorSearch: [''],
      
      isMachoExterno: [false],
      vacunoDonanteId: [null],
      vacunoDonanteSearch: [''],
      nombreMachoExterno: [''],
      
      codigoSemen: [''],
      codigoEmbrion: [''],
      
      fechaProcedimiento: ['', Validators.required],
      responsable: ['', Validators.required], // Replaced 'responsableId' with string input as per image
      resultadoCode: ['PENDIENTE', Validators.required],
      observaciones: ['']
    });
  }

  private setupDynamicValidations() {
    // Tipo de fecundacion changes
    this.form.get('tipoFecundacionCode')?.valueChanges.subscribe(tipo => {
      const semenCtrl = this.form.get('codigoSemen');
      const embrionCtrl = this.form.get('codigoEmbrion');
      const donanteIdCtrl = this.form.get('vacunoDonanteId');
      const donanteSearchCtrl = this.form.get('vacunoDonanteSearch');
      const machoExtCtrl = this.form.get('isMachoExterno');
      const machoExtNameCtrl = this.form.get('nombreMachoExterno');

      semenCtrl?.clearValidators();
      embrionCtrl?.clearValidators();

      if (tipo === 'INSEMINACION_ARTIFICIAL') {
        semenCtrl?.setValidators([Validators.required]);
      } else if (tipo === 'TRANSFERENCIA_EMBRIONES') {
        embrionCtrl?.setValidators([Validators.required]);
        // Embrion doesnt strictly need macho info, but if needed we can clear it
        machoExtCtrl?.setValue(true);
        machoExtNameCtrl?.setValue('Desconocido (Embrión)');
      } else if (tipo === 'MONTA_NATURAL') {
        // Monta natural strictly needs macho
      }
      
      semenCtrl?.updateValueAndValidity();
      embrionCtrl?.updateValueAndValidity();
    });

    // Macho externo checkbox changes
    this.form.get('isMachoExterno')?.valueChanges.subscribe(isExterno => {
      const donanteIdCtrl = this.form.get('vacunoDonanteId');
      const machoExtNameCtrl = this.form.get('nombreMachoExterno');
      
      if (isExterno) {
        donanteIdCtrl?.clearValidators();
        donanteIdCtrl?.setValue(null);
        this.selectedDonante = null;
        machoExtNameCtrl?.setValidators([Validators.required]);
      } else {
        machoExtNameCtrl?.clearValidators();
        machoExtNameCtrl?.setValue('');
        // We only require one of them basically
      }
      donanteIdCtrl?.updateValueAndValidity();
      machoExtNameCtrl?.updateValueAndValidity();
    });
  }

  private setupAutocomplete() {
    // Receptores (Hembras)
    this.vacunosReceptores$ = this.form.get('vacunoReceptorSearch')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => typeof term === 'string' && term.length > 0),
      tap(() => this.isLoadingReceptores = true),
      switchMap(term => this.vacunosApi.listarVacunos({ q: term }).pipe(
        map((res) => res.items.filter((v: Vacuno) => v.sexo === 'H' && v.estado === 'activo')), // Only alive females
        catchError(() => of([]))
      )),
      tap(() => this.isLoadingReceptores = false)
    );

    // Donantes (Machos)
    this.vacunosDonantes$ = this.form.get('vacunoDonanteSearch')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => typeof term === 'string' && term.length > 0),
      tap(() => this.isLoadingDonantes = true),
      switchMap(term => this.vacunosApi.listarVacunos({ q: term }).pipe(
        map((res) => res.items.filter((v: Vacuno) => v.sexo === 'M')), // Only males
        catchError(() => of([]))
      )),
      tap(() => this.isLoadingDonantes = false)
    );
  }

  selectReceptor(vacuno: Vacuno) {
    this.selectedReceptor = vacuno;
    this.form.patchValue({
      vacunoReceptorId: vacuno.id,
      vacunoReceptorSearch: vacuno.nombre
    });
  }

  selectDonante(vacuno: Vacuno) {
    this.selectedDonante = vacuno;
    this.form.patchValue({
      vacunoDonanteId: vacuno.id,
      vacunoDonanteSearch: vacuno.nombre
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.form.value;
    
    // El backend espera `responsableId` pero en la UI es un string libre según la imagen.
    // Usaremos un ID dummy temporal o podemos mandar el string si adaptamos el backend, pero el backend requiere un INT (responsableId).
    // Asumiré que mando un ID fijo temporal o 1 por ahora para simular el usuario logueado.
    const responsableIdTemp = 1;

    const request = {
      tipoFecundacionCode: formValue.tipoFecundacionCode,
      vacunoReceptorId: formValue.vacunoReceptorId,
      vacunoDonanteId: formValue.isMachoExterno ? null : formValue.vacunoDonanteId,
      nombreMachoExterno: formValue.isMachoExterno ? formValue.nombreMachoExterno : null,
      fechaProcedimiento: formValue.fechaProcedimiento,
      responsableId: responsableIdTemp, 
      codigoSemen: formValue.codigoSemen,
      codigoEmbrion: formValue.codigoEmbrion,
      observaciones: formValue.observaciones
    };

    this.fecundacionApi.registrarFecundacion(request).subscribe({
      next: () => {
        this.successMessage = this.translate.instant('reproduccion.fecundacion.registro.messages.success');
        this.isSubmitting = false;
        // Optionally redirect or reset form
        setTimeout(() => {
          this.router.navigate(['/reproduccion/fecundacion']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err?.message || this.translate.instant('reproduccion.fecundacion.registro.messages.error');
        this.isSubmitting = false;
      }
    });
  }
}
