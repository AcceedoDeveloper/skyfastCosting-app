import { Routes} from '@angular/router';
import { ProcessComponent} from './process/process.component';
import { RawMaterialComponent} from './raw-material/raw-material.component';

export const productRoutes: Routes = [
    {
        path: '',
        component: ProcessComponent
    },
    {
        path: 'raw-materials',
        component: RawMaterialComponent
    },
];
