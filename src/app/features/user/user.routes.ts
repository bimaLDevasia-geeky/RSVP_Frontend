import { Routes } from '@angular/router';
import { Home } from './home/home';

export const routes: Routes = [

   {path: '', loadComponent: () => import('./home/home').then(m => m.Home),},
   { path:"myevents", loadComponent: () => import('./myevents/myevents').then(m => m.Myevents)}
   
];
