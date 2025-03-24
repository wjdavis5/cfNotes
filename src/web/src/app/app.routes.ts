import { Routes } from '@angular/router';
import { AuthContainerComponent } from './containers/auth-container.component';
import { AppLayoutContainerComponent } from './containers/app-layout-container.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutContainerComponent,
    children: [
      {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full'
      },
      {
        path: 'auth',
        component: AuthContainerComponent
      },
      {
        path: 'notes',
        canMatch: [authGuard],
        loadChildren: () => import('./notes/notes.routes').then(m => m.NOTES_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];
