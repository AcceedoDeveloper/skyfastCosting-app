import { Routes} from '@angular/router';
import { CompanyPreferencesComponent} from './company-preferences/company-preferences.component';
import { RoleManagementComponent} from './role-management/role-management.component';
import {DepartmentCreationComponent } from './department-creation/department-creation.component';
import {HostingMailSettingsComponent} from './hosting-mail-settings/hosting-mail-settings.component';
import { PermissionComponent} from './permission/permission.component';
import { ShiftManagementComponent} from './shift-management/shift-management.component';
import { EmailTemplateComponent} from './email-template/email-template.component';
import { authGuard } from '../../services/auth.guard';

export const systemRoutes: Routes = [
    {
    path: 'companypreferences',
    component: CompanyPreferencesComponent
    },
    {
        path: 'roles',
        component: RoleManagementComponent
    },
    {
        path: 'departments',
        component: DepartmentCreationComponent
    },
    {
        path: 'hosting-mail-settings',
        component: HostingMailSettingsComponent
    },
    // Permissions
  {
    path: 'permissions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./permission/permission.component').then(
        (m) => m.PermissionComponent
      ),
  },
    {
        path: 'shifts',
        component: ShiftManagementComponent
    },
    {
        path: 'email-templates',
        component: EmailTemplateComponent
    }
];