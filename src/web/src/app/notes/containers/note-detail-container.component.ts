import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NoteEditorComponent } from '../../components/note-editor.component';
import { NoteService } from '../../services/note.service';
import { CryptoService } from '../../services/crypto.service';
import { ThemeService } from '../../services/theme.service';
import { Theme } from '../../models/theme.model';
import { Subscription } from 'rxjs';

// Placeholder interface until Nx libraries are properly set up
interface PlainNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: string;
  title: string;
  encryptedContent: string;
  iv: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-note-detail-container',
  standalone: true,
  imports: [CommonModule, RouterModule, NoteEditorComponent],
  template: `
    <div class="note-detail-container">
      <!-- Action buttons -->
      <div class="action-buttons">
        <div class="button-group">
          <button
            *ngIf="!isNewNote && !saving"
            class="delete-button"
            (click)="deleteNote()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="button-icon">
              <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Z" clip-rule="evenodd" />
            </svg>
            Delete
          </button>

          <button
            class="save-button"
            [disabled]="saving"
            (click)="saveNote()"
          >
            <svg *ngIf="!saving" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="button-icon">
              <path fill-rule="evenodd" d="M5.478 5.559A1.5 1.5 0 0 1 6.912 4.5H9A.75.75 0 0 0 9 3H6.912a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H15a.75.75 0 0 0 0 1.5h2.088a1.5 1.5 0 0 1 1.434 1.059l2.213 7.191H17.89a3 3 0 0 0-2.684 1.658l-.256.513a1.5 1.5 0 0 1-1.342.829h-3.218a1.5 1.5 0 0 1-1.342-.83l-.256-.512a3 3 0 0 0-2.684-1.658H3.265l2.213-7.191Z" clip-rule="evenodd" />
              <path fill-rule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v6.44l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V3a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
            </svg>
            <svg *ngIf="saving" class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <div *ngIf="error" class="error-message">
        <div class="error-content">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="error-icon">
            <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
          </svg>
          {{ error }}
        </div>
      </div>

      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
      </div>

      <app-note-editor
        *ngIf="!loading"
        class="editor-container"
        [note]="note"
        (noteChange)="onNoteChange($event)"
      ></app-note-editor>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }

    .note-detail-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 1rem 0.5rem;
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
      padding: 0 0.5rem;
    }

    .button-group {
      display: flex;
      gap: 0.75rem;
    }

    .button-icon {
      width: 1rem;
      height: 1rem;
      margin-right: 0.25rem;
    }

    .delete-button, .save-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .delete-button {
      border: 1px solid var(--border-color);
      background-color: transparent;
      color: var(--error-color);
    }

    .delete-button:hover {
      background-color: rgba(var(--error-color-rgb), 0.1);
    }

    .save-button {
      background-color: var(--accent-color);
      color: white;
      border: none;
    }

    .save-button:hover:not(:disabled) {
      filter: brightness(110%);
    }

    .save-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .error-message {
      padding: 1rem;
      margin: 0 0.5rem 1rem 0.5rem;
      border-radius: 0.5rem;
      border: 1px solid var(--error-color);
      background-color: rgba(var(--error-color-rgb), 0.1);
      color: var(--error-color);
    }

    .error-content {
      display: flex;
      align-items: flex-start;
    }

    .error-icon {
      width: 1.25rem;
      height: 1.25rem;
      margin-right: 0.5rem;
      flex-shrink: 0;
    }

    .loading-container {
      flex-grow: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-spinner {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      border: 0.25rem solid var(--border-color);
      border-top-color: var(--accent-color);
      animation: spin 1s linear infinite;
    }

    .spinner {
      animation: spin 1s linear infinite;
      width: 1rem;
      height: 1rem;
    }

    .editor-container {
      flex-grow: 1;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `
})
export class NoteDetailContainerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private noteService = inject(NoteService);
  private cryptoService = inject(CryptoService);
  private themeService = inject(ThemeService);

  private subscriptions = new Subscription();
  private autoSaveTimer: any;
  private noteId: string | null = null;
  private hasChanges = false;

  note: PlainNote | null = null;
  loading = true;
  saving = false;
  error: string | null = null;
  isNewNote = false;
  currentTheme = Theme.LIGHT;

  ngOnInit(): void {
    // Get note ID from URL
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        this.noteId = params.get('id');
        if (this.noteId) {
          this.loadNote(this.noteId);
        } else {
          this.router.navigate(['/notes']);
        }
      })
    );

    // Subscribe to theme changes
    this.subscriptions.add(
      this.themeService.currentTheme$.subscribe(theme => {
        this.currentTheme = theme;
      })
    );

    // Set up autosave
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions and timers
    this.subscriptions.unsubscribe();

    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }

  /**
   * Load note from service
   */
  private async loadNote(noteId: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Check if there's already a current note in the service (e.g., for new notes)
      const currentNote = await this.noteService.currentNote$.subscribe(note => {
        if (note && note.id === noteId) {
          this.note = note;
          this.isNewNote = true;
          this.loading = false;
        }
      });

      // If no current note was found, load from API
      if (this.loading && !this.isNewNote) {
        const encryptedNote = await this.noteService.getNote(noteId);

        if (!encryptedNote) {
          throw new Error('Note not found');
        }

        // Ensure password is set for decryption
        if (!this.cryptoService.hasPassword()) {
          this.router.navigate(['/auth']);
          return;
        }

        // Decrypt note
        this.note = await this.cryptoService.decryptNote(encryptedNote);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      this.error = 'Failed to load note. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Handle note changes from editor
   */
  onNoteChange(changes: Partial<PlainNote>): void {
    if (!this.note) return;

    // Update the note with changes
    this.note = {
      ...this.note,
      ...changes,
      updatedAt: new Date().toISOString()
    };

    this.hasChanges = true;
  }

  /**
   * Save the note
   */
  async saveNote(): Promise<void> {
    if (!this.note || !this.noteId) return;

    this.saving = true;
    this.error = null;

    try {
      // Encrypt the note
      const encryptedNote = await this.cryptoService.encryptNote(this.note);

      // Save to the server
      await this.noteService.updateNote(this.noteId, encryptedNote);

      // Reset hasChanges flag
      this.hasChanges = false;
    } catch (error) {
      console.error('Error saving note:', error);
      this.error = 'Failed to save note. Please try again.';
    } finally {
      this.saving = false;
    }
  }

  /**
   * Delete the note
   */
  async deleteNote(): Promise<void> {
    if (!this.noteId) return;

    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;

    try {
      await this.noteService.deleteNote(this.noteId);
      this.router.navigate(['/notes']);
    } catch (error) {
      console.error('Error deleting note:', error);
      this.error = 'Failed to delete note. Please try again.';
    }
  }

  /**
   * Set up autosave timer
   */
  private setupAutoSave(): void {
    // Autosave every 30 seconds if there are changes
    this.autoSaveTimer = setInterval(() => {
      if (this.hasChanges && !this.saving && this.note) {
        this.saveNote();
      }
    }, 30000);
  }
}
