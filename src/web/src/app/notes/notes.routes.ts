import { Routes } from '@angular/router';
import { reAuthGuard } from '../guards/reauth.guard';
import { NotesLayoutComponent } from './containers/notes-layout.component';
import { NoteDetailContainerComponent } from './containers/note-detail-container.component';

export const NOTES_ROUTES: Routes = [
  {
    path: '',
    component: NotesLayoutComponent,
    children: [
      {
        path: '',
        component: NoteDetailContainerComponent
      },
      {
        path: ':id',
        canActivate: [reAuthGuard],
        component: NoteDetailContainerComponent
      }
    ]
  }
];
