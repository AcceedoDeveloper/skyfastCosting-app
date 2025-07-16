import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
     {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/regsister/regsister.component').then(m => m.RegsisterComponent)
  },
  {
    path: 'todos',
    loadComponent: () => import('./post-login/postlogin/postlogin.component').then(m => m.PostloginComponent),
    canActivate : [authGuard]
  },

   { path: '', redirectTo: '/todos', pathMatch: 'full' }, 
  { path: '**', redirectTo: '/todos' }
];
