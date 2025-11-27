import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { postLoginRoutes } from './post-login/postlogin/postlogin.routes';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'quotation',
    // No auth guard - accessible for server-side PDF generation
    // This route is public and should be accessible without authentication
    loadComponent: () => import('./product/customer-details/pdf-view/pdf-view.component').then(m => m.PdfViewComponent),
    canActivate: [] // Explicitly set empty array to ensure no guards are applied
  },
  {
    path: 'report-full-view',
    // Public route so report PDFs can be opened without auth
    loadComponent: () => import('./product/report/report-full-view/report-full-view.component').then(m => m.ReportFullViewComponent),
    canActivate: []
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
  {
    path: 'product',
    canActivate: [authGuard],
    loadChildren: () => import('./product/product.routes').then(m => m.productRoutes)
  },
  ...postLoginRoutes,
  { path: '', redirectTo: '/system', pathMatch: 'full' },
  // Wildcard route - redirect to system, but quotation route should match before this
  { path: '**', redirectTo: '/system' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }