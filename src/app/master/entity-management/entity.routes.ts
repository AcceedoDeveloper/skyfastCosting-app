import { Routes} from '@angular/router';
import { UserManagementComponent} from './user-management/user-management.component';
import {CustomerComponent } from './customer/customer.component';
import { MachineRegistryComponent} from './machine-registry/machine-registry.component';
import {MachineTypeComponent } from './machine-type/machine-type.component';



export const entityRoutes: Routes = [
    {
        path: '',
        component: UserManagementComponent
    },
    {
        path: 'customers',
        component: CustomerComponent
    },
    {
        path: 'machine-registry',
        component: MachineRegistryComponent
    },
    {
        path: 'machine-type',
        component: MachineTypeComponent
    }
];