import { Routes } from '@angular/router';
import { Home } from './home/home';

export const routes: Routes = [

   {path: '', loadComponent: () => import('./home/home').then(m => m.Home),},
   { path:"myevents", loadComponent: () => import('./myevents/myevents').then(m => m.Myevents) },
   {path:"myevents/addevent", loadComponent: () => import('./myevents/pages/addevent/addevent').then(m => m.Addevent)},
   {path:"myevents/edit/:id", loadComponent: () => import('./myevents/pages/editevent/editevent').then(m => m.Editevent)},
   {path:"myevents/:id", loadComponent: () => import('./myevents/pages/eventdetail/eventdetail').then(m => m.Eventdetail)},
   {path:"invitedevents", loadComponent: () => import('./invtitedevents/invtitedevents').then(m => m.Invtitedevents)},
   {path:"invitedevents/:id", loadComponent: () => import('./invitedevents-detail/invitedevents-detail').then(m => m.InvitedeventsDetailComponent)},
];

