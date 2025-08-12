import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { postLoginRoutes} from './post-login/postlogin/postlogin.routes';

export const routes: Routes = [
     {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },

  {
    path: 'todos',
    canActivate: [authGuard],
    loadComponent: () => import('./post-login/postlogin/postlogin.component').then(m => m.PostloginComponent)
    
  },

  {
    path: 'system',
    canActivate: [authGuard],
    loadChildren: () => import('./master/system-organization/system.routes').then(m => m.systemRoutes)
  },

    {
    path: 'entity',
    canActivate: [authGuard],
    loadChildren: () => import('./master/entity-management/entity.routes').then(m => m.entityRoutes)
  },

  

  ...postLoginRoutes,


   { path: '', redirectTo: '/system', pathMatch: 'full' }, 
  { path: '**', redirectTo: '/system' }
];
