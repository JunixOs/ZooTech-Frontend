import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@core/api/api.config';
import { VacunoService } from './vacunos.service';

describe('VacunoService', () => {
  let service: VacunoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VacunoService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api/v1' },
      ],
    });

    service = TestBed.inject(VacunoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('mapea la lista del backend al modelo de dominio', () => {
    service.getAll({ page: 2, pageSize: 5, search: 'Luna' }).subscribe((result) => {
      expect(result.items).toHaveLength(1);
      expect(result.items[0].codigo).toBe('VAC-001');
      expect(result.items[0].estado).toBe('vivo');
      expect(result.paginaActual).toBe(2);
      expect(result.totalPaginas).toBe(3);
    });

    const req = httpMock.expectOne((request) => request.url === '/api/v1/vacunos');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('5');
    expect(req.request.params.get('search')).toBe('Luna');

    req.flush({
      data: [
        {
          id: 1,
          codigo: 'VAC-001',
          nombre: 'Luna',
          fechaNacimiento: '2025-01-10',
          razaCode: 'HOLSTEIN',
          sexoCode: 'HEMBRA',
          procedencia: 'Lima',
          estado: 'Activo',
          createdAt: '2026-01-02T10:00:00Z',
        },
      ],
      pagination: {
        page: 2,
        pageSize: 5,
        total: 11,
        totalPages: 3,
      },
    });
  });

  it('envia el payload normalizado al crear un vacuno', () => {
    service.create({
      codigo: 'VAC-002',
      nombre: 'Sol',
      fechaNacimiento: '2025-02-12',
      adquisicionPor: 'NACIMIENTO',
      raza: 'JERSEY',
      color: 'MARRON',
      sexo: 'HEMBRA',
      codigoPadre: '',
      codigoMadre: '',
      granjaId: 3,
      aptoPara: 'LECHE',
      fechaEspecificacion: '2026-01-01',
      observaciones: '  registro inicial  ',
    }).subscribe((result) => {
      expect(result.codigo).toBe('VAC-002');
    });

    const req = httpMock.expectOne('/api/v1/vacunos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject({
      codigo: 'VAC-002',
      tipoAdquisicionCode: 'NACIMIENTO',
      razaCode: 'JERSEY',
      sexoCode: 'HEMBRA',
      granjaId: 3,
      observaciones: 'registro inicial',
    });

    req.flush({
      data: {
        codigo: 'VAC-002',
        nombre: 'Sol',
        fechaNacimiento: '2025-02-12',
        adquisicionPor: 'NACIMIENTO',
        creadoEn: '2026-01-01T00:00:00Z',
      },
      success: true,
      errorMessage: null,
    });
  });

  it('envia la foto y el payload como multipart al registrar', () => {
    const photo = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47])],
      'vacuno.png',
      { type: 'image/png' },
    );

    service.create({
      codigo: 'VAC-003',
      nombre: 'Luna',
      fechaNacimiento: '2025-02-12',
      adquisicionPor: 'NACIMIENTO',
      raza: 'JERSEY',
      color: 'MARRON',
      sexo: 'HEMBRA',
      codigoPadre: '',
      codigoMadre: '',
      granjaId: 3,
      aptoPara: 'LECHE',
      fechaEspecificacion: '2026-01-01',
      foto: photo,
    }).subscribe();

    const req = httpMock.expectOne('/api/v1/vacunos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);

    const form = req.request.body as FormData;
    const attachedPhoto = form.get('foto') as File;
    expect(attachedPhoto.name).toBe(photo.name);
    expect(attachedPhoto.type).toBe(photo.type);
    expect(attachedPhoto.size).toBe(photo.size);
    expect(JSON.parse(String(form.get('payload')))).toMatchObject({
      codigo: 'VAC-003',
      granjaId: 3,
      fechaEspecificacion: '2026-01-01',
    });

    req.flush({
      data: {
        codigo: 'VAC-003',
        nombre: 'Luna',
        fechaNacimiento: '2025-02-12',
        adquisicionPor: 'NACIMIENTO',
        creadoEn: '2026-01-01T00:00:00Z',
        fotoUrl: '/api/v1/vacunos/3/foto',
      },
      success: true,
      errorMessage: null,
    });
  });

  it('obtiene los catalogos propios del tenant sin sustituir sus codigos', () => {
    service.getCatalogs().subscribe((catalogs) => {
      expect(catalogs.sexos).toEqual([
        { code: 'H', nombre: 'Hembra' },
        { code: 'M', nombre: 'Macho' },
      ]);
      expect(catalogs.utilizaciones[0].code).toBe('PRODUCCION_LECHE');
    });

    const req = httpMock.expectOne('/api/v1/vacunos/catalogos');
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: {
        tiposAdquisicion: [{ code: 'NACIMIENTO', nombre: 'Nacimiento' }],
        razas: [{ code: 'HOLSTEIN', nombre: 'Holstein' }],
        colores: [{ code: 'BLANCO', nombre: 'Blanco' }],
        sexos: [
          { code: 'H', nombre: 'Hembra' },
          { code: 'M', nombre: 'Macho' },
        ],
        estados: [],
        utilizaciones: [{ code: 'PRODUCCION_LECHE', nombre: 'Produccion de leche' }],
        granjas: [{ id: 1, nombre: 'Granja de prueba' }],
      },
    });
  });

  it('preserva precio y codigos del catalogo al editar un vacuno', () => {
    service.updateById(7, {
      codigo: 'VAC007',
      nombre: 'Luna',
      fechaNacimiento: '2024-01-01',
      adquisicionPor: 'COMPRA',
      precioCompra: 850.5,
      raza: 'HOLSTEIN',
      color: 'BLANCO',
      sexo: 'H',
      codigoPadre: '',
      codigoMadre: '',
      granjaId: 1,
      aptoPara: 'PRODUCCION_LECHE',
      fechaEspecificacion: '2026-07-23',
    }).subscribe();

    const req = httpMock.expectOne('/api/v1/vacunos/7');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toMatchObject({
      tipoAdquisicionCode: 'COMPRA',
      sexoCode: 'H',
      aptoPara: 'PRODUCCION_LECHE',
      precioCompra: 850.5,
    });

    req.flush({
      success: true,
      data: {
        id: 7,
        codigo: 'VAC007',
        nombre: 'Luna',
        fechaNacimiento: '2024-01-01',
        tipoAdquisicionCode: 'COMPRA',
        razaCode: 'HOLSTEIN',
        colorCode: 'BLANCO',
        sexoCode: 'H',
        granjaId: 1,
        precioCompra: 850.5,
      },
    });
  });

  it.each(['excel', 'pdf'] as const)(
    'delega la genealogia %s al backend como blob',
    (formato) => {
      service.exportarArbol(15, 4, formato).subscribe((blob) => {
        expect(blob.type).toBe('application/octet-stream');
      });

      const req = httpMock.expectOne(
        (request) => request.url === '/api/v1/vacunos/15/genealogia/exportar',
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('formato')).toBe(formato);
      expect(req.request.params.get('niveles')).toBe('4');
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob(['report'], { type: 'application/octet-stream' }));
    },
  );

  it('delega la actividad al backend enviando formato y rango', () => {
    service.exportarActividad('pdf', '2026-07-01', '2026-07-20').subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === '/api/v1/vacunos/estadisticas/actividad/exportar',
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('formato')).toBe('pdf');
    expect(req.request.params.get('fechaInicio')).toBe('2026-07-01');
    expect(req.request.params.get('fechaFin')).toBe('2026-07-20');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['report'], { type: 'application/pdf' }));
  });
});
