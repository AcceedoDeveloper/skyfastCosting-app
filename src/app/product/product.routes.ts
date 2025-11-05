import { Routes} from '@angular/router';
import { ProcessComponent} from './process/process.component';
import { RawMaterialComponent} from './raw-material/raw-material.component';
import {CustomerDetailsComponent } from './customer-details/customer-details.component';
import {DashboardComponent } from './dashboard/dashboard.component';

export const productRoutes: Routes = [
    {
        path: '',
        component: ProcessComponent
    },
    {
        path: 'raw-materials',
        component: RawMaterialComponent
    },
    {
        path: 'quatation',
        component: CustomerDetailsComponent

    },
    {
        path: 'dashboard',
        component: DashboardComponent
    }
];
