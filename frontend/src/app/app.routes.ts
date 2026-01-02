import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'main',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/main/main.component').then(m => m.MainComponent),
  },
  { path: '**', redirectTo: 'login' },
];
