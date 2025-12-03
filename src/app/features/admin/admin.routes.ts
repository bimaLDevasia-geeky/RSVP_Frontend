import { Routes } from '@angular/router';

export const adminRoutes : Routes = [
    {path:'',loadComponent:()=>import('./dashboard/dashboard').then(m=>m.Dashboard)},
    {path:'manage-users',loadComponent:()=>import('./manage-users/manage-users').then(m=>m.ManageUsers)},
    {path:'manage-events',loadComponent:()=>import('./manage-events/manage-events').then(m=>m.ManageEvents)},
]