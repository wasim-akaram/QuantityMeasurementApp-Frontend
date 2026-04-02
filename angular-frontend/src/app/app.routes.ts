import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { DashboardComponent } from './dashboard.component';

export const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '' }
];
