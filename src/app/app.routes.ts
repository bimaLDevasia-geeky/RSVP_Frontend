import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layouts/user-layout/user-layout').then((m) => m.UserLayout),
    loadChildren: () => import('./features/user/user.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/user-login/user-login').then((m) => m.UserLogin),
  },

  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/user-register/user-register').then((m) => m.UserRegister),
  },

  {
    path: 'admin',
    loadComponent: () =>
      import('./core/layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),
  },

  {
    path:'admin/login',loadComponent:()=>import('./features/auth/pages/admin-login/admin-login').then(m=>m.AdminLogin)
   }

  
];
