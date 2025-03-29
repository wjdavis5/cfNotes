import { Routes } from '@angular/router';
import { reAuthGuard } from '../guards/reauth.guard';

export const NOTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./containers/notes-list-container.component').then(m => m.NotesListContainerComponent)
  },
  {
    path: ':id',
    canActivate: [reAuthGuard],
    loadComponent: () => import('./containers/note-detail-container.component').then(m => m.NoteDetailContainerComponent)
  }
];
