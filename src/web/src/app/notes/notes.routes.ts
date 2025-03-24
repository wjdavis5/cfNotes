import { Routes } from '@angular/router';

export const NOTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./containers/notes-list-container.component').then(m => m.NotesListContainerComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./containers/notes-list-container.component').then(m => m.NotesListContainerComponent)
  }
];
