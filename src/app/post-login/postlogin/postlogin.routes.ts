
import { Routes } from '@angular/router';
export const postLoginRoutes: Routes = [
  {
    path: 'todos/trail',
    loadComponent: () => import('./trail/trail.component').then(m => m.TrailComponent)
  }
];