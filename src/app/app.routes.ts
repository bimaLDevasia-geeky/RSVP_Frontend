import { Routes } from '@angular/router';
import { loginGuard } from './core/auth/guards/login-guard';
import { authGuard } from './core/auth/guards/auth-guard';
import { adminGuard } from './core/auth/guards/admin-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layouts/user-layout/user-layout').then((m) => m.UserLayout),
    loadChildren: () => import('./features/user/user.routes').then((m) => m.routes),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/user-login/user-login').then((m) => m.UserLogin),
    canActivate: [loginGuard]
  },

  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/user-register/user-register').then((m) => m.UserRegister),
    canActivate: [loginGuard]
  },

  {
    path: 'admin',
    loadComponent: () =>
      import('./core/layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
    canActivate: [adminGuard],
  },

  {
    path:'admin/login',loadComponent:()=>import('./features/auth/pages/admin-login/admin-login').then(m=>m.AdminLogin),
    canActivate:[loginGuard]
   },

   {
    path :"invite/:code",loadComponent:()=>import('./features/user/invite/invite').then(m=>m.Invite)
   },

   {
    path: '**',
    pathMatch: 'full',
    redirectTo: ''

   }

  
];
