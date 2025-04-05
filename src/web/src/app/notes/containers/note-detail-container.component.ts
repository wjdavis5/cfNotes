import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteEditorComponent } from '../../components/note-editor.component';
import { NoteService } from '../../services/note.service';
import { CryptoService } from '../../services/crypto.service';
import { Subject, Subscription, debounceTime } from 'rxjs'
import { ToastService } from '../../services/toast.service';

// Placeholder interface until Nx libraries are properly set up
interface PlainNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-note-detail-container',
  standalone: true,
  imports: [CommonModule, NoteEditorComponent],
  template: `
    <!-- Loading state -->
    <div *ngIf="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading note...</p>
    </div>

    <!-- Error state -->
    <div *ngIf="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button class="action-btn" (click)="goToNotes()">Back to Notes</button>
    </div>

    <!-- Note editor -->
    <div *ngIf="!loading && !error && currentNote" class="editor-wrapper">
      <div class="editor-header">
        <h2>{{ currentNote.title || 'Untitled Note' }}</h2>
        <button class="back-btn" (click)="goToNotes()">Back to list</button>
      </div>
      <app-note-editor
        [note]="currentNote"
        (noteChange)="handleNoteChange($event)"
      ></app-note-editor>
    </div>

    <!-- Welcome message when no note selected -->
    <div *ngIf="!loading && !error && !currentNote" class="welcome-container">
      <div class="welcome-content">
        <h2 class="welcome-header">Welcome to cfNote</h2>
        <p class="welcome-text">Select a note or create a new one to get started</p>

        <div class="security-info">
          <h3 class="security-header">How Your Data Stays Private</h3>
          <ul class="security-list">
            <li><strong>Zero-knowledge privacy:</strong> Your email address is never stored directly - we only use a secure hash of your email for authentication and to associate your notes.</li>
            <li><strong>End-to-end encryption:</strong> All notes are encrypted with AES-256 in your browser before being stored. Only you can decrypt them with your password.</li>
            <li><strong>Secure key management:</strong> Your password never leaves your device and is used to generate encryption keys.</li>
            <li><strong>Memory-only option:</strong> Advanced security mode keeps encryption keys only in memory, never in browser storage.</li>
            <li><strong>Session timeouts:</strong> Automatic logout after 30 minutes of inactivity protects your data.</li>
            <li><strong>Page exit protection:</strong> Automatically logs you out when closing tabs or navigating away.</li>
            <li><strong>Cloudflare KV storage:</strong> Encrypted notes are stored in Cloudflare's global key-value storage, linked only to your email's hash, not your actual email.</li>
            <li><strong>No plaintext content:</strong> Note titles, content, and metadata are all encrypted - we have zero access to your information.</li>
          </ul>
        </div>

        <button class="action-btn create-btn" (click)="createNewNote()">
          Create New Note
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
    }

    .loading-container, .error-container, .welcome-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(var(--accent-color-rgb), 0.3);
      border-radius: 50%;
      border-top-color: var(--accent-color);
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      color: var(--error-color);
      background-color: rgba(var(--error-color-rgb), 0.1);
      border: 1px solid var(--error-color);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .action-btn {
      padding: 8px 16px;
      background-color: var(--accent-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .action-btn:hover {
      background-color: var(--accent-hover-color, #0056b3);
    }

    .editor-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .editor-header h2 {
      margin: 0;
      color: var(--text-color);
    }

    .back-btn {
      padding: 6px 12px;
      background-color: var(--secondary-color);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .back-btn:hover {
      background-color: var(--hover-color);
    }

    .welcome-content {
      max-width: 650px;
      padding: 20px;
    }

    .welcome-header {
      font-size: 1.875rem;
      font-weight: bold;
      margin-bottom: 16px;
      color: var(--text-color);
    }

    .welcome-text {
      font-size: 1.125rem;
      margin-bottom: 24px;
      color: var(--text-muted-color);
    }

    .security-info {
      margin: 24px 0;
      padding: 20px;
      border-radius: 8px;
      background-color: rgba(var(--accent-color-rgb), 0.1);
      border: 1px solid var(--border-color);
      text-align: left;
    }

    .security-header {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--accent-color);
    }

    .security-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    .security-list li {
      margin-bottom: 12px;
      padding-left: 24px;
      position: relative;
    }

    .security-list li:before {
      content: '✓';
      color: var(--accent-color);
      position: absolute;
      left: 0;
      font-weight: bold;
    }

    .security-list li:last-child {
      margin-bottom: 0;
    }

    .create-btn {
      margin-top: 20px;
      min-width: 180px;
    }
  `
})
export class NoteDetailContainerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private noteService = inject(NoteService);
  private cryptoService = inject(CryptoService);
  private toastService = inject(ToastService);

  currentNote: PlainNote | null = null;
  loading = true;
  error: string | null = null;

  // For autosave functionality
  private noteChangeSubject = new Subject<PlainNote>();
  private saveSubscription: Subscription | null = null;

  ngOnInit(): void {
    // Get the note ID from the route
    this.route.paramMap.subscribe(params => {
      const noteId = params.get('id');
      if (noteId) {
        this.loadNote(noteId);
      } else {
        // Not an error case, just no note selected - show welcome message
        this.loading = false;
        this.error = null;
        this.currentNote = null;
      }
    });

    // Set up autosave
    this.saveSubscription = this.noteChangeSubject
      .pipe(debounceTime(1000)) // Debounce for 1 second
      .subscribe(note => {
        this.saveNote(note);
      });
  }

  ngOnDestroy(): void {
    if (this.saveSubscription) {
      this.saveSubscription.unsubscribe();
    }
  }

  async loadNote(noteId: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Load directly from API instead of relying on cached data
      const encryptedNote = await this.noteService.getNote(noteId);

      if (!encryptedNote) {
        this.error = 'Note not found';
        this.loading = false;
        return;
      }

      // Decrypt the note
      this.currentNote = await this.cryptoService.decryptNote(encryptedNote);

      // Update the current note in the service
      this.noteService.setCurrentNote(this.currentNote);
    } catch (error) {
      console.error('Error loading note:', error);
      this.error = 'Failed to load note. Please try again.';
      this.toastService.error('Failed to load note');
    } finally {
      this.loading = false;
    }
  }

  handleNoteChange(noteChanges: Partial<PlainNote>): void {
    if (!this.currentNote) return;

    // Update the current note with changes
    this.currentNote = {
      ...this.currentNote,
      ...noteChanges,
      updatedAt: new Date().toISOString()
    };

    // Trigger autosave
    this.noteChangeSubject.next(this.currentNote);
  }

  async saveNote(note: PlainNote): Promise<void> {
    try {
      // Encrypt the note
      const encryptedNote = await this.cryptoService.encryptNote(note);

      // Save to API
      await this.noteService.updateNote(note.id, encryptedNote);
    } catch (error) {
      console.error('Error saving note:', error);
      this.error = 'Failed to save note. Please try again.';
      this.toastService.error('Failed to save note');
    }
  }

  goToNotes(): void {
    this.router.navigate(['/notes']);
  }

  createNewNote(): void {
    // Generate unique ID
    const newNoteId = crypto.randomUUID();

    this.toastService.info('Creating new note...');

    // Create a new note object
    const newNote: PlainNote = {
      id: newNoteId,
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Set as current note in service
    this.noteService.setCurrentNote(newNote);

    // Navigate to the new note
    this.router.navigate(['/notes', newNoteId]);
  }
}
