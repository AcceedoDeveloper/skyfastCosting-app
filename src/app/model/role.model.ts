// role.model.ts

export interface Role {
  _id: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  __v: number;
}

export interface Department {
  _id: string;
  department: string;
  departmentCode: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface Shift {
  _id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  __v: number;
}

export interface HostingMail {
  _id: string;
  smtpServer: string;
  portNo: string;
  emailId: string;
  password: string;
  EncryptionType: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}


// permission.model 

export interface Permission {
  _id?: string;
  role: string;
  screens: Screens;
  initialScreen: string;
  __v: number;
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