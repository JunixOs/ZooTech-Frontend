[1mdiff --git a/src/app/app.routes.ts b/src/app/app.routes.ts[m
[1mindex 1dcb16f..a417da3 100644[m
[1m--- a/src/app/app.routes.ts[m
[1m+++ b/src/app/app.routes.ts[m
[36m@@ -26,8 +26,13 @@[m [mexport const routes: Routes = [[m
       path: 'sanidad/reportes', [m
       loadComponent: () => import('./modules/sanidad/presentation/reporte-container/reporte-container')[m
         .then(m => m.ReporteContainer) [m
[31m-    },[m
[32m+[m[32m      },[m
[32m+[m[32m      {[m
[32m+[m[32m        path: 'vacunos',[m
[32m+[m[32m        loadComponent: () => import('./modules/vacuno/presentation/vacuno-container/vacuno-container')[m
[32m+[m[32m          .then(m => m.VacunoContainerComponent),[m
[32m+[m[32m      },[m
     ][m
   },[m
   { path: '**', redirectTo: '' }[m
[31m-];[m
\ No newline at end of file[m
[32m+[m[32m];[m
[1mdiff --git a/src/app/layout/sidebar/sidebar.ts b/src/app/layout/sidebar/sidebar.ts[m
[1mindex 867a22e..062a017 100644[m
[1m--- a/src/app/layout/sidebar/sidebar.ts[m
[1m+++ b/src/app/layout/sidebar/sidebar.ts[m
[36m@@ -14,7 +14,7 @@[m [mexport class Sidebar {[m
     {[m
       icon: 'fa-solid fa-cow',[m
       label: 'VACUNOS',[m
[31m-      router: 'vacuno',[m
[32m+[m[32m      router: 'vacunos',[m
     },[m
 [m
     {[m
[1mdiff --git a/src/app/modules/vacuno/application/services/vacuno.service.ts b/src/app/modules/vacuno/application/services/vacuno.service.ts[m
[1mnew file mode 100644[m
[1mindex 0000000..f255612[m
[1m--- /dev/null[m
[1m+++ b/src/app/modules/vacuno/application/services/vacuno.service.ts[m
[36m@@ -0,0 +1,99 @@[m
[32m+[m[32mimport { Injectable, inject } from '@angular/core';[m
[32m+[m[32mimport { HttpClient, HttpParams } from '@angular/common/http';[m
[32m+[m[32mimport { Observable } from 'rxjs';[m
[32m+[m[32mimport {[m
[32m+[m[32m  VacunoListResponse,[m
[32m+[m[32m  VacunoFiltros,[m
[32m+[m[32m  VacunoDetalle,[m
[32m+[m[32m  RegistrarVacunoRequest,[m
[32m+[m[32m  RegistrarVacunoResponse,[m
[32m+[m[32m  EditarVacunoRequest,[m
[32m+[m[32m} from '../../domain/models/vacuno.model';[m
[32m+[m
[32m+[m[32m@Injectable({ providedIn: 'root' })[m
[32m+[m[32mexport class VacunoService {[m
[32m+[m[32m  private readonly http = inject(HttpClient);[m
[32m+[m[32m  private readonly base = '/v1/vacunos';[m
[32m+[m
[32m+[m[32m  // ── GET /v1/vacunos ───────────────────────────────────────────────────────[m
[32m+[m[32m  listar(filtros: VacunoFiltros = {}): Observable<VacunoListResponse> {[m
[32m+[m[32m    let params = new HttpParams();[m
[32m+[m[32m    if (filtros.page) params = params.set('page', filtros.page);[m
[32m+[m[32m    if (filtros.limit) params = params.set('limit', filtros.limit);[m
[32m+[m[32m    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);[m
[32m+[m[32m    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);[m
[32m+[m[32m    if (filtros.q) params = params.set('q', filtros.q);[m
[32m+[m[32m    if (filtros.raza) params = params.set('raza', filtros.raza);[m
[32m+[m[32m    if (filtros.procedencia) params = params.set('procedencia', filtros.procedencia);[m
[32m+[m[32m    if (filtros.estado) params = params.set('estado', filtros.estado);[m
[32m+[m[32m    return this.http.get<VacunoListResponse>(this.base, { params });[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  // ── GET /v1/vacunos/:id ───────────────────────────────────────────────────[m
[32m+[m[32m  obtenerDetalle(id: number): Observable<VacunoDetalle> {[m
[32m+[m[32m    return this.http.get<VacunoDetalle>(`${this.base}/${id}`);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  // ── POST /v1/vacunos ──────────────────────────────────────────────────────[m
[32m+[m[32m  registrar(data: RegistrarVacunoRequest): Observable<RegistrarVacunoResponse> {[m
[32m+[m[32m    const fd = new FormData();[m
[32m+[m
[32m+[m[32m    // Campos de texto — alineados exactamente con el API Contract[m
[32m+[m[32m    fd.append('codigo', data.codigo);[m
[32m+[m[32m    fd.append('nombre', data.nombre);[m
[32m+[m[32m    fd.append('fechaNacimiento', data.fechaNacimiento);[m
[32m+[m[32m    fd.append('adquisicionPor', data.adquisicionPor);[m
[32m+[m[32m    fd.append('raza', data.raza);[m
[32m+[m[32m    fd.append('color', data.color);[m
[32m+[m[32m    fd.append('sexo', data.sexo);[m
[32m+[m[32m    fd.append('codigoPadre', data.codigoPadre);[m
[32m+[m[32m    fd.append('codigoMadre', data.codigoMadre);[m
[32m+[m[32m    fd.append('granja', data.granja);[m
[32m+[m[32m    fd.append('distrito', data.distrito);[m
[32m+[m[32m    fd.append('departamento', data.departamento);[m
[32m+[m[32m    fd.append('provincia', data.provincia);[m
[32m+[m[32m    fd.append('aptoPara', data.aptoPara);[m
[32m+[m[32m    fd.append('fechaEspecificacion', data.fechaEspecificacion);[m
[32m+[m
[32m+[m[32m    // Campos opcionales — solo se adjuntan si tienen valor[m
[32m+[m[32m    if (data.precioCompra != null) {[m
[32m+[m[32m      fd.append('precioCompra', String(data.precioCompra));[m
[32m+[m[32m    }[m
[32m+[m[32m    if (data.observaciones?.trim()) {[m
[32m+[m[32m      fd.append('observaciones', data.observaciones.trim());[m
[32m+[m[32m    }[m
[32m+[m[32m    if (data.foto instanceof File) {[m
[32m+[m[32m      fd.append('foto', data.foto, data.foto.name);[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    return this.http.post<RegistrarVacunoResponse>(this.base, fd);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  // ── PATCH /v1/vacunos/:id ─────────────────────────────────────────────────[m
[32m+[m[32m  editar(id: number, data: EditarVacunoRequest): Observable<Partial<VacunoDetalle>> {[m
[32m+[m[32m    const fd = new FormData();[m
[32m+[m
[32m+[m[32m    if (data.nombre) fd.append('nombre', data.nombre);[m
[32m+[m[32m    if (data.precioCompra != null) fd.append('precioCompra', String(data.precioCompra));[m
[32m+[m[32m    if (data.raza) fd.append('raza', data.raza);[m
[32m+[m[32m    if (data.color) fd.append('color', data.color);[m
[32m+[m[32m    if (data.sexo) fd.append('sexo', data.sexo);[m
[32m+[m[32m    if (data.granja) fd.append('granja', data.granja);[m
[32m+[m[32m    if (data.distrito) fd.append('distrito', data.distrito);[m
[32m+[m[32m    if (data.departamento) fd.append('departamento', data.departamento);[m
[32m+[m[32m    if (data.provincia) fd.append('provincia', data.provincia);[m
[32m+[m[32m    if (data.aptoPara) fd.append('aptoPara', data.aptoPara);[m
[32m+[m[32m    if (data.fechaEspecificacion) fd.append('fechaEspecificacion', data.fechaEspecificacion);[m
[32m+[m[32m    if (data.observaciones?.trim()) fd.append('observaciones', data.observaciones!.trim());[m
[32m+[m[32m    if (data.foto instanceof File) fd.append('foto', data.foto, data.foto.name);[m
[32m+[m
[32m+[m[32m    return this.http.patch<Partial<VacunoDetalle>>(`${this.base}/${id}`, fd);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  // ── DELETE /v1/vacunos/:id ────────────────────────────────────────────────[m
[32m+[m[32m  eliminar(id: number, razon: string): Observable<void> {[m
[32m+[m[32m    return this.http.delete<void>(`${this.base}/${id}`, {[m
[32m+[m[32m      body: { razon },[m
[32m+[m[32m    });[m
[32m+[m[32m  }[m
[32m+[m[32m}[m
[1mdiff --git a/src/app/modules/vacuno/domain/models/vacuno.model.ts b/src/app/modules/vacuno/domain/models/vacuno.model.ts[m
[1mnew file mode 100644[m
[1mindex 0000000..7ae3862[m
[1m--- /dev/null[m
[1m+++ b/src/app/modules/vacuno/domain/models/vacuno.model.ts[m
[36m@@ -0,0 +1,128 @@[m
[32m+[m[32m// ─────────────────────────────────────────────────────────────────────────────[m
[32m+[m[32m// Tipos exactos según el API Contract del módulo Vacuno v1.0.0[m
[32m+[m[32m// Endpoint base: /v1/vacunos[m
[32m+[m[32m// ─────────────────────────────────────────────────────────────────────────────[m
[32m+[m
[32m+[m[32m// ── Enums del contrato ────────────────────────────────────────────────────────[m
[32m+[m[32mexport type AdquisicionPor = 'monta' | 'compra';[m
[32m+[m[32mexport type SexoVacuno = 'macho' | 'hembra';[m
[32m+[m[32mexport type EstadoVacuno = 'vivo' | 'muerto';[m
[32m+[m[32mexport type AptoPara = 'produccion_leche' | 'carne' | 'reproduccion';[m
[32m+[m
[32m+[m[32m// ── GET /v1/vacunos ──────────────────────────────────────────────────────────[m
[32m+[m[32mexport interface VacunoListItem {[m
[32m+[m[32m  id: number;[m
[32m+[m[32m  codigo: string;[m
[32m+[m[32m  fechaRegistro: string;[m
[32m+[m[32m  nombre: string;[m
[32m+[m[32m  raza: string;[m
[32m+[m[32m  procedencia: string;[m
[32m+[m[32m  estado: EstadoVacuno;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mexport interface VacunoListResponse {[m
[32m+[m[32m  data: VacunoListItem[];[m
[32m+[m[32m  pagination: {[m
[32m+[m[32m    page: number;[m
[32m+[m[32m    limit: number;[m
[32m+[m[32m    total: number;[m
[32m+[m[32m    totalPages: number;[m
[32m+[m[32m  };[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mexport interface VacunoFiltros {[m
[32m+[m[32m  page?: number;[m
[32m+[m[32m  limit?: number;[m
[32m+[m[32m  fechaDesde?: string;[m
[32m+[m[32m  fechaHasta?: string;[m
[32m+[m[32m  q?: string;[m
[32m+[m[32m  raza?: string;[m
[32m+[m[32m  procedencia?: string;[m
[32m+[m[32m  estado?: EstadoVacuno | '';[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m// ── GET /v1/vacunos/:id ───────────────────────────────────────────────────────[m
[32m+[m[32mexport interface VacunoDetalle {[m
[32m+[m[32m  id: number;[m
[32m+[m[32m  codigo: string;[m
[32m+[m[32m  nombre: string;[m
[32m+[m[32m  fechaNacimiento: string;  // YYYY-MM-DD[m
[32m+[m[32m  adquisicionPor: AdquisicionPor;[m
[32m+[m[32m  precioCompra: number | null;[m
[32m+[m[32m  raza: string;[m
[32m+[m[32m  color: string;[m
[32m+[m[32m  sexo: SexoVacuno;[m
[32m+[m[32m  codigoPadre: string;[m
[32m+[m[32m  codigoMadre: string;[m
[32m+[m[32m  granja: string;[m
[32m+[m[32m  distrito: string;[m
[32m+[m[32m  departamento: string;[m
[32m+[m[32m  provincia: string;[m
[32m+[m[32m  aptoPara: AptoPara;[m
[32m+[m[32m  fechaEspecificacion: string;  // YYYY-MM-DD[m
[32m+[m[32m  observaciones: string | null;[m
[32m+[m[32m  fotoUrl: string | null;[m
[32m+[m[32m  estado: EstadoVacuno;[m
[32m+[m[32m  creadoEn: string;  // ISO 8601[m
[32m+[m[32m  actualizadoEn: string;  // ISO 8601[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m// ── POST /v1/vacunos ─────────────────────────────────────────────────────────[m
[32m+[m[32m// Los campos coinciden EXACTAMENTE con los nombres del API Contract (multipart/form-data)[m
[32m+[m[32mexport interface RegistrarVacunoRequest {[m
[32m+[m[32m  codigo: string;[m
[32m+[m[32m  nombre: string;[m
[32m+[m[32m  fechaNacimiento: string;[m
[32m+[m[32m  adquisicionPor: AdquisicionPor;[m
[32m+[m[32m  precioCompra?: number | null;[m
[32m+[m[32m  raza: string;[m
[32m+[m[32m  color: string;[m
[32m+[m[32m  sexo: SexoVacuno;[m
[32m+[m[32m  codigoPadre: string;[m
[32m+[m[32m  codigoMadre: string;[m
[32m+[m[32m  granja: string;[m
[32m+[m[32m  distrito: string;[m
[32m+[m[32m  departamento: string;[m
[32m+[m[32m  provincia: string;[m
[32m+[m[32m  aptoPara: AptoPara;[m
[32m+[m[32m  fechaEspecificacion: string;[m
[32m+[m[32m  observaciones?: string;[m
[32m+[m[32m  foto?: File | null;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mexport interface RegistrarVacunoResponse {[m
[32m+[m[32m  id: number;[m
[32m+[m[32m  codigo: string;[m
[32m+[m[32m  nombre: string;[m
[32m+[m[32m  fechaNacimiento: string;[m
[32m+[m[32m  adquisicionPor: AdquisicionPor;[m
[32m+[m[32m  precioCompra: number | null;[m
[32m+[m[32m  fotoUrl: string | null;[m
[32m+[m[32m  creadoEn: string;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m// ── PATCH /v1/vacunos/:id ─────────────────────────────────────────────────────[m
[32m+[m[32mexport interface EditarVacunoRequest {[m
[32m+[m[32m  nombre?: string;[m
[32m+[m[32m  precioCompra?: number | null;[m
[32m+[m[32m  raza?: string;[m
[32m+[m[32m  color?: string;[m
[32m+[m[32m  sexo?: SexoVacuno;[m
[32m+[m[32m  granja?: string;[m
[32m+[m[32m  distrito?: string;[m
[32m+[m[32m  departamento?: string;[m
[32m+[m[32m  provincia?: string;[m
[32m+[m[32m  aptoPara?: AptoPara;[m
[32m+[m[32m  fechaEspecificacion?: string;[m
[32m+[m[32m  foto?: File | null;[m
[32m+[m[32m  observaciones?: string;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m// ── Error estándar del API ────────────────────────────────────────────────────[m
[32m+[m[32mexport interface ApiError {[m
[32m+[m[32m  error: {[m
[32m+[m[32m    code: string;[m
[32m+[m[32m    message: string;[m
[32m+[m[32m    details: { field: string; message: string }[];[m
[32m+[m[32m  };[m
[32m+[m[32m}[m
[1mdiff --git a/src/app/modules/vacuno/presentation/vacuno-container/vacuno-container.html b/src/app/modules/vacuno/presentation/vacuno-container/vacuno-container.html[m
[1mnew file mode 100644[m
[1mindex 0000000..54ec59d[m
[1m--- /dev/null[m
[1m+++ b/src/app/modules/vacuno/presentation/vacuno-container/vacuno-container.html[m
[36m@@ -0,0 +1,41 @@[m
[32m+[m[32m<div class="vc">[m
[32m+[m
[32m+[m[32m  <!-- Cabecera fija con título -->[m
[32m+[m[32m  <div class="vc__header">[m
[32m+[m[32m    <h1 class="vc__title">{{ tituloVista }}</h1>[m
[32m+[m[32m    <span class="vc__breadcrumb">{{ tituloVista }}</span>[m
[32m+[m[32m  </div>[m
[32m+[m
[32m+[m[32m  <!-- Error global -->[m
[32m+[m[32m  @if (error()) {[m
[32m+[m[32m  <div class="vc__error">⚠ {{ error() }}</div>[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  <!-- Listado -->[m
[32m+[m[32m  @if (vista() === 'list') {[m
[32m+[m[32m  <app-vacuno-list [vacunos]="vacunos()"[m
[32m+[m[32m                   [cargando]="cargando()"[m
[32m+[m[32m                   [pagination]="pagination()"[m
[32m+[m[32m                   (onNuevo)="irAFormNuevo()"[m
[32m+[m[32m                   (onVerDetalle)="irADetalle($event)"[m
[32m+[m[32m                   (onFiltrar)="cargarLista($event)"[m
[32m+[m[32m                   (onCambiarPagina)="cargarLista({ page: $event, limit: pagination().limit })" />[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  <!-- Formulario (página completa, sin modal) -->[m
[32m+[m[32m  @if (vista() === 'form') {[m
[32m+[m[32m  <app-vacuno-form [modoEdicion]="modoEdicion()"[m
[32m+[m[32m                   [vacunoDetalle]="vacunoSeleccionado()"[m
[32m+[m[32m                   (onCancelar)="irALista()"[m
[32m+[m[32m                   (onGuardado)="irALista()" />[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  <!-- Detalle -->[m
[32m+[m[32m  @if (vista() === 'detail') {[m
[32m+[m[32m  <app-vacuno-detail [vacuno]="vacunoSeleccionado()"[m
[32m+[m[32m                     (onVolver)="irALista()"[m
[32m+[m[32m                     (onEditar)="irAEditar($event)"[m
[32m+[m[32m                     (onEliminado)="irALista()" />[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m</div>[m
[1mdiff --git a/src/app/modules/vacuno/presentation/vacuno-container/vacuno-container.scss b/src/app/modules/vacuno/presentation/vacuno-container/vacuno-container.scss[m
[1mnew file mode 100644[m
[1mindex 0000000..d14c0e8[m
[1m--- /dev/null[m
[1m+++ b/src/app/modules/vacuno/presentation/vacuno-container/vacuno-container.scss[m
[36m@@ -0,0 +1,37 @@[m
[32m+[m[32m$burg: #9b1c4a;[m
[32m+[m
[32m+[m[32m.vc {[m
[32m+[m[32m  min-height: 100%;[m
[32m+[m[32m  background: #e8e8e8;[m
[32m+[m[32m  font-family: 'Segoe UI', system-ui, sans-serif;[m
[32m+[m
[32m+[m[32m  &__header {[m
[32m+[m[32m    display: flex;[m
[32m+[m[32m    align-items: center;[m
[32m+[m[32m    justify-content: space-between;[m
[32m+[m[32m    padding: 14px 20px 10px;[m
[32m+[m[32m    background: #ffffff;[m
[32m+[m[32m    border-bottom: 1px solid #dddddd;[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  &__title {[m
[32m+[m[32m    font-size: 1.25rem;[m
[32m+[m[32m    font-weight: 600;[m
[32m+[m[32m    color: #333333;[m
[32m+[m[32m    margin: 0;[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  &__breadcrumb {[m
[32m+[m[32m    font-size: 0.8125rem;[m
[32m+[m[32m    color: #888888;[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  &__error {[m
[32m+[m[32m    background: #ffebee;[m
[32m+[m[32m    border: 1px solid #ef9a9a;[m
[32m+[m[32m    color: #c62828;[m
[32m+[m[32m    padding: 10px 20px;[m
[32m+[m[32m    font-size: 0.875rem;[m
[32m+[m[32m    font-weight: 500;[m
[32m+[m[32m  }[m
[32m+[m[32m}[m
[1mdiff --git a/src/app/modules/vacuno/presentation/vacuno-container/vacuno-container.ts b/src/app/modules/vacuno/presentation/vacuno-container/vacuno-container.ts[m
[1mnew file mode 100644[m
[1mindex 0000000..3fcf652[m
[1m--- /dev/null[m
[1m+++ b/src/app/modules/vacuno/presentation/vacuno-container/vacuno-container.ts[m
[36m@@ -0,0 +1,78 @@[m
[32m+[m[32mimport { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';[m
[32m+[m[32mimport { takeUntilDestroyed } from '@angular/core/rxjs-interop';[m
[32m+[m[32mimport { CommonModule } from '@angular/common';[m
[32m+[m[32mimport { VacunoService } from '../../application/services/vacuno.service';[m
[32m+[m[32mimport { VacunoListItem, VacunoFiltros, VacunoDetalle } from '../../domain/models/vacuno.model';[m
[32m+[m[32mimport { VacunoListComponent } from '../vacuno-list/vacuno-list';[m
[32m+[m[32mimport { VacunoFormComponent } from '../vacuno-form/vacuno-form';[m
[32m+[m[32mimport { VacunoDetailComponent } from '../vacuno-detail/vacuno-detail';[m
[32m+[m
[32m+[m[32mexport type Vista = 'list' | 'form' | 'detail';[m
[32m+[m
[32m+[m[32m@Component({[m
[32m+[m[32m  selector: 'app-vacuno-container',[m
[32m+[m[32m  standalone: true,[m
[32m+[m[32m  imports: [CommonModule, VacunoListComponent, VacunoFormComponent, VacunoDetailComponent],[m
[32m+[m[32m  templateUrl: './vacuno-container.html',[m
[32m+[m[32m  styleUrl: './vacuno-container.scss',[m
[32m+[m[32m})[m
[32m+[m[32mexport class VacunoContainerComponent implements OnInit {[m
[32m+[m[32m  private readonly svc = inject(VacunoService);[m
[32m+[m[32m  private readonly destroyRef = inject(DestroyRef);[m
[32m+[m
[32m+[m[32m  readonly vista = signal<Vist