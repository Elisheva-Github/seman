import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AdminComponent } from './pages/admin/admin.component';
import { BusinessComponent } from './pages/business/business.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  // ההתחברות והבדיקה שהמשתמשת היא הבעלים מתבצעות בתוך מסך הניהול עצמו,
  // וההרשאה האמיתית נאכפת בצד השרת באמצעות RLS בלבד.
  { path: 'admin', component: AdminComponent },
  { path: 'biz/:slug', component: BusinessComponent },
  { path: '**', redirectTo: '' }
];
