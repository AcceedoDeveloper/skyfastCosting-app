import { Routes} from '@angular/router';
import { UserManagementComponent} from './user-management/user-management.component';
import {CustomerComponent } from './customer/customer.component';



export const entityRoutes: Routes = [
    {
        path: '',
        component: UserManagementComponent
    },
    {
        path: 'customers',
        component: CustomerComponent
    },
];