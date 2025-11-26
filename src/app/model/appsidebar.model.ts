export interface SidebarItem {
  label: string;
  route: string;
  icon: string;
  submenu?: SidebarItem[];
}

export interface UserChildren { user: boolean; role: boolean; shift: boolean; customer: boolean; version: boolean; }
export interface CompanyChildren { companyPreferences: boolean; permission: boolean; }
export interface MaterialChildren { rawMaterial: boolean; process: boolean; }

export interface PermissionGroup<T> { parent: boolean; children: T; }

export interface Permissions {
  dashboard: boolean;
  user: PermissionGroup<UserChildren>;
  company: PermissionGroup<CompanyChildren>;
  material: PermissionGroup<MaterialChildren>;
  quotation: boolean;
  reports: boolean;
}