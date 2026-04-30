export interface NavChild {
  icon: string;
  label: string;
  router: string;
}

export interface NavSection {
  icon: string;
  label: string;
  children?: NavChild[];   // opcional, si no tiene es link directo
  router?: string;         // opcional, solo si no tiene hijos
}