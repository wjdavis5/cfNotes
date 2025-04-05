import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotesListContainerComponent } from './notes-list-container.component';

@Component({
  selector: 'app-notes-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NotesListContainerComponent],
  template: `
    <div class="notes-layout">
      <!-- Notes list sidebar - always visible -->
      <app-notes-list-container class="notes-sidebar"></app-notes-list-container>

      <!-- Main content area for detail view -->
      <div class="notes-main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: `
    .notes-layout {
      display: flex;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .notes-sidebar {
      width: 280px;
      min-width: 280px;
      overflow-y: auto;
      border-right: 1px solid var(--border-color);
      background-color: var(--sidebar-bg-color);
    }

    .notes-main-content {
      flex: 1;
      overflow-y: auto;
      background-color: var(--card-bg-color);
    }
  `
})
export class NotesLayoutComponent {}
