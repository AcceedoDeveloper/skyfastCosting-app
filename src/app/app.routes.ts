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
    path: 'role',
    loadComponent: () => import('./role/role.component').then(m => m.RoleComponent)
  },

  ...postLoginRoutes,


   { path: '', redirectTo: '/todos', pathMatch: 'full' }, 
  { path: '**', redirectTo: '/todos' }
];
