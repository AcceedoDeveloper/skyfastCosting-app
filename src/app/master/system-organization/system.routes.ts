import { Routes} from '@angular/router';
import { CompanyPreferencesComponent} from './company-preferences/company-preferences.component';
import { RoleManagementComponent} from './role-management/role-management.component';
import {DepartmentCreationComponent } from './department-creation/department-creation.component';
import {HostingMailSettingsComponent} from './hosting-mail-settings/hosting-mail-settings.component';
import { PermissionComponent} from './permission/permission.component';
import { ShiftManagementComponent} from './shift-management/shift-management.component';


export const systemRoutes: Routes = [
    {
    path: '',
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
    {
        path: 'permissions',
        component: PermissionComponent
    },
    {
        path: 'shifts',
        component: ShiftManagementComponent
    }
];