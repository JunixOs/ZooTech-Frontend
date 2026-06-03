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
