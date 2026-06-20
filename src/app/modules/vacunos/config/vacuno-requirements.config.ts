export const VACUNOS_SETTING_CODES = {
  defaultFilterDays: 'VACUNOS_DEFAULT_FILTER_DAYS',
  arbolMinNiveles: 'VACUNOS_ARBOL_MIN_NIVELES',
  arbolMaxNiveles: 'VACUNOS_ARBOL_MAX_NIVELES',
  codigoMaxLength: 'VACUNOS_CODIGO_MAX_LENGTH',
  inputMaxLength: 'VACUNOS_INPUT_MAX_LENGTH',
  observacionesMaxLength: 'VACUNOS_OBSERVACIONES_MAX_LENGTH',
  observacionesMaxWords: 'VACUNOS_OBSERVACIONES_MAX_WORDS',
  fotoFormatosPermitidos: 'VACUNOS_FOTO_FORMATOS_PERMITIDOS',
  codigoUppercaseRequired: 'VACUNOS_CODIGO_UPPERCASE_REQUIRED',
  reporteFormatosDescarga: 'VACUNOS_REPORTE_FORMATOS_DESCARGA',
  eliminacionUndoSeconds: 'VACUNOS_ELIMINACION_UNDO_SECONDS',
  fecundacionObservacionesMaxLength: 'VACUNOS_FECUNDACION_OBSERVACIONES_MAX_LENGTH',
} as const;

export const VACUNOS_FEATURE_CODES = {
  moduleVacunos: 'MODULE_VACUNOS',
  moduleVacunosReproduccion: 'MODULE_VACUNOS_REPRODUCCION',
  moduleVacunosReportes: 'MODULE_VACUNOS_REPORTES',
} as const;

export const VACUNOS_RULE_CODES = {
  eliminacionCondicionada: 'VACUNOS_ELIMINACION_CONDICIONADA',
  fecundacionTrazabilidad: 'VACUNOS_FECUNDACION_TRAZABILIDAD',
  fecundacionPendienteUnica: 'VACUNOS_FECUNDACION_PENDIENTE_UNICA',
} as const;

export const VACUNOS_I18N_KEYS = {
  errorCampoObligatorio: 'Error_CampoObligatorio',
  errorCodigoMaxLength: 'Error_CodigoMaxLength',
  errorInputMaxLength: 'Error_InputMaxLength',
  errorObservacionesMaxLength: 'Error_ObservacionesMaxLength',
  errorFotoFormatoInvalido: 'Error_FotoFormatoInvalido',
  successRegistroVacunoCreado: 'Success_RegistroVacunoCreado',
  successRegistroVacunoActualizado: 'Success_RegistroVacunoActualizado',
  labelEstadoVivo: 'Label_EstadoVivo',
  labelEstadoMuerto: 'Label_EstadoMuerto',
  formatFechaRegistro: 'Format_FechaRegistro',
} as const;

export const VACUNOS_SETTING_DEFAULTS = {
  [VACUNOS_SETTING_CODES.defaultFilterDays]: 30,
  [VACUNOS_SETTING_CODES.arbolMinNiveles]: 1,
  [VACUNOS_SETTING_CODES.arbolMaxNiveles]: 4,
  [VACUNOS_SETTING_CODES.codigoMaxLength]: 15,
  [VACUNOS_SETTING_CODES.inputMaxLength]: 15,
  [VACUNOS_SETTING_CODES.observacionesMaxLength]: 150,
  [VACUNOS_SETTING_CODES.observacionesMaxWords]: 30,
  [VACUNOS_SETTING_CODES.fotoFormatosPermitidos]: 'png,jpg,jpeg',
  [VACUNOS_SETTING_CODES.codigoUppercaseRequired]: true,
  [VACUNOS_SETTING_CODES.reporteFormatosDescarga]: 'xlsx,pdf',
  [VACUNOS_SETTING_CODES.eliminacionUndoSeconds]: 5,
  [VACUNOS_SETTING_CODES.fecundacionObservacionesMaxLength]: 500,
} as const;

export const VACUNOS_CATALOG_VALUES = {
  adquisicion: {
    monta: 'monta',
    compra: 'compra',
  },
  sexo: {
    hembra: 'hembra',
    macho: 'macho',
  },
  aptoPara: {
    produccionLeche: 'produccion_leche',
    carne: 'carne',
    reproduccion: 'reproduccion',
  },
  estado: {
    activo: 'activo',
    eliminado: 'eliminado',
    vivo: 'vivo',
    muerto: 'muerto',
  },
} as const;

export const VACUNOS_CATALOG_OPTIONS = {
  adquisicion: [
    VACUNOS_CATALOG_VALUES.adquisicion.monta,
    VACUNOS_CATALOG_VALUES.adquisicion.compra,
  ],
  raza: [
    'Aberdeen Angus',
    'Angus',
    'Ayrshire',
    'Beefmaster',
    'Bonsmara',
    'Braford',
    'Brahman',
    'Brangus',
    'Brown Swiss',
    'Charolais',
    'Chianina',
    'Criollo',
    'Dexter',
    'Fleckvieh',
    'Galloway',
    'Gelbvieh',
    'Girolando',
    'Gyr',
    'Hereford',
    'Holstein',
    'Jersey',
    'Limousin',
    'Marchigiana',
    'Normando',
    'Pardo Suizo',
    'Red Angus',
    'Romagnola',
    'Santa Gertrudis',
    'Shorthorn',
    'Simmental',
    'Wagyu',
  ],
  sexo: [
    VACUNOS_CATALOG_VALUES.sexo.hembra,
    VACUNOS_CATALOG_VALUES.sexo.macho,
  ],
  aptoPara: [
    VACUNOS_CATALOG_VALUES.aptoPara.produccionLeche,
    VACUNOS_CATALOG_VALUES.aptoPara.carne,
    VACUNOS_CATALOG_VALUES.aptoPara.reproduccion,
  ],
} as const;

export const VACUNOS_FORM_DEFAULTS = {
  adquisicionPor: '',
  raza: '',
  sexo: '',
  aptoPara: '',
} as const;

export const VACUNOS_FIELD_LIMITS = {
  codigo: VACUNOS_SETTING_DEFAULTS[VACUNOS_SETTING_CODES.codigoMaxLength],
  texto: VACUNOS_SETTING_DEFAULTS[VACUNOS_SETTING_CODES.inputMaxLength],
  nombre: 100,
  catalogoCodigo: 30,
  ubigeoNombre: 60,
  observacionesCaracteres: VACUNOS_SETTING_DEFAULTS[VACUNOS_SETTING_CODES.observacionesMaxLength],
  observacionesPalabras: VACUNOS_SETTING_DEFAULTS[VACUNOS_SETTING_CODES.observacionesMaxWords],
  dropdownVisibleOptions: 5,
} as const;

export const VACUNOS_VALIDATION_PATTERNS = {
  codigo: /^[A-Z0-9]+$/,
  codigoSanitizer: /[^A-Z0-9]/g,
  decimalKey: /^[0-9.]$/,
  wordSeparator: /\s+/,
} as const;

export const VACUNOS_INPUT_KEYS = {
  allowedNavigationKeys: ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'],
  decimalSeparator: '.',
} as const;

export const VACUNOS_IMAGE_CONFIG = {
  allowedExtensionsCsv: VACUNOS_SETTING_DEFAULTS[VACUNOS_SETTING_CODES.fotoFormatosPermitidos],
  acceptedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
  acceptAttribute: '.png,.jpg,.jpeg,image/png,image/jpeg',
} as const;

export const VACUNOS_ROUTES = {
  list: '/vacunos',
  create: '/vacunos/agregar',
  edit: (id: string | number) => `/vacunos/editar/${id}`,
  detail: (id: string | number) => `/vacunos/${id}`,
} as const;

export const VACUNOS_API_CONFIG = {
  resource: 'vacuno',
  catalogs: 'catalogos',
  activityStats: 'estadisticas/actividad',
  genealogia: 'genealogia',
  queryKeys: {
    page: 'page',
    limit: 'limit',
    search: 'q',
    estado: 'estado',
    fechaDesde: 'fechaDesde',
    fechaHasta: 'fechaHasta',
    fechaInicio: 'fechaInicio',
    fechaFin: 'fechaFin',
    niveles: 'niveles',
  },
} as const;

export const VACUNO_REQUIREMENTS_CONFIG = {
  settingsGroup: 'Vacunos',
  settings: VACUNOS_SETTING_DEFAULTS,
  features: VACUNOS_FEATURE_CODES,
  rules: VACUNOS_RULE_CODES,
  i18n: VACUNOS_I18N_KEYS,
  catalogOptions: VACUNOS_CATALOG_OPTIONS,
  catalogValues: VACUNOS_CATALOG_VALUES,
  formDefaults: VACUNOS_FORM_DEFAULTS,
  fieldLimits: VACUNOS_FIELD_LIMITS,
  validationPatterns: VACUNOS_VALIDATION_PATTERNS,
  inputKeys: VACUNOS_INPUT_KEYS,
  image: VACUNOS_IMAGE_CONFIG,
  routes: VACUNOS_ROUTES,
  api: VACUNOS_API_CONFIG,
  verVacuno: {
    excluirEliminados: true,
    permitirBusquedaCodigoSinSeparadores: true,
  },
  graficoVacunosEnActividad: {
    diasPorDefecto: VACUNOS_SETTING_DEFAULTS[VACUNOS_SETTING_CODES.defaultFilterDays],
    maximoDiasRango: 366,
  },
} as const;
