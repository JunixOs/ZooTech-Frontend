<<<<<<< Updated upstream
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

=======
export interface NavItem {
  icon: string;
  label: string;
  router?: string;
  children?: NavItem[];
}

/** @deprecated use NavItem */
export type NavSection = NavItem;
/** @deprecated use NavItem */
export type NavChild = NavItem;
>>>>>>> Stashed changes
