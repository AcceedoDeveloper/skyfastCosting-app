// permission.model.ts

export interface Permission {
  _id?: string;
  role: string;
  screens: Screens;
  initialScreen: string;
   __v?: number;
}

export interface Screens {
  dashboard: boolean;
  user: PermissionGroup<UserChildren>;
  company: PermissionGroup<CompanyChildren>;
  material: PermissionGroup<MaterialChildren>;
  quotation: boolean;
  reports: boolean;
}

export interface PermissionGroup<T> {
  parent: boolean;
  children: T;
}

export interface UserChildren {
  user: boolean;
  role: boolean;
  shift: boolean;
  customer: boolean;
  version: boolean;
}

export interface CompanyChildren {
  companyPreferences: boolean;
  permission: boolean;
}

export interface MaterialChildren {
  rawMaterial: boolean;
  process: boolean;
}


export interface PermissionState {
  list: Permission[];   
  loading: boolean;      
  error: any;            
}
