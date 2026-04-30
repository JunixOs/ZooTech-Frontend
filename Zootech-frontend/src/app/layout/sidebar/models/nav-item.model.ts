export interface NavSection {
  icon: string;
  label: string;
  children?: NavChild[];  
  router?: string;         
}

export interface NavChild {
  icon: string;
  label: string;
  router: string;
}

