import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { NoteCardComponent } from '../../components/note-card.component';
import { NoteService } from '../../services/note.service';
import { CryptoService } from '../../services/crypto.service';
import { ThemeService } from '../../services/theme.service';
import { Theme } from '../../models/theme.model';
import { NoteEditorComponent } from '../../components/note-editor.component';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { AuthService } from '../../services/auth.service';

// Placeholder interface until Nx libraries are properly set up
interface PlainNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  decryptionError?: boolean; // Flag for notes that failed to decrypt
}

@Component({
  selector: 'app-notes-list-container',
  standalone: true,
  imports: [CommonModule, RouterModule, NoteEditorComponent],
  template: `
    <!-- Full page container -->
    <div class="notes-container">
      <!-- Main layout with themed styling -->
      <div class="main-layout">
        <!-- Left sidebar -->
        <div class="sidebar">
          <h2 class="sidebar-header">My Notes</h2>

          <!-- New Note Button -->
          <button
            class="action-btn new-note-btn"
            (click)="createNewNote()"
          >
            New Note
          </button>

          <!-- Loading State -->
          <div *ngIf="loading" class="loading">
            <span>Loading notes...</span>
          </div>

          <!-- Error State -->
          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>

          <!-- Notes List -->
          <div *ngIf="!loading && !error && notes.length > 0" class="notes-list">
            <div *ngFor="let note of notes"
                 class="note-item"
                 [class.error-note]="note.decryptionError"
                 [class.active-note]="isActiveNote(note.id)"
                 (click)="viewNote(note.id)"
                 (keydown.enter)="viewNote(note.id)"
                 (keydown.space)="viewNote(note.id)"
                 tabindex="0"
                 role="button"
                 [attr.aria-label]="'View note: ' + (note.title || 'Untitled Note')"
            >
              <div class="note-content">
                <p class="note-title">{{ note.title || 'Untitled Note' }}</p>
                <p *ngIf="!note.decryptionError" class="note-date">{{ formatDate(note.updatedAt) }}</p>
                <p *ngIf="note.decryptionError" class="note-error">This note could not be decrypted</p>
              </div>
              <button
                class="delete-icon"
                (click)="confirmDeleteNote(note.id, $event)"
                aria-label="Delete note"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
                  <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && !error && notes.length === 0" class="empty-state">
            <p class="empty-title">No notes yet</p>
            <p class="empty-subtitle">Create your first note to get started</p>
          </div>
        </div>

        <!-- Main content area -->
        <div class="content-area" id="content-area">
          <!-- Welcome message when no note selected -->
          <div *ngIf="!selectedNoteId" class="welcome-message">
            <div class="welcome-content">
              <h2 class="welcome-header">Welcome to cfNote</h2>
              <p class="welcome-text">Select a note or create a new one to get started</p>

              <div class="security-info">
                <h3 class="security-header">How Your Data Stays Private</h3>
                <ul class="security-list">
                  <li><strong>Zero-knowledge privacy:</strong> Your email address is never stored directly - we only use a secure hash of your email for authentication and to associate your notes.</li>
                  <li><strong>End-to-end encryption:</strong> All notes are encrypted with AES-256 in your browser before being stored. Only you can decrypt them with your password.</li>
                  <li><strong>Secure key management:</strong> Your password never leaves your device and is used to generate encryption keys.</li>
                  <li><strong>Cloudflare KV storage:</strong> Encrypted notes are stored in Cloudflare's global key-value storage, linked only to your email's hash, not your actual email.</li>
                  <li><strong>No plaintext content:</strong> Note titles, content, and metadata are all encrypted - we have zero access to your information.</li>
                </ul>
              </div>

              <button
                *ngIf="notes.length === 0"
                class="action-btn create-first-btn"
                (click)="createNewNote()"
              >
                Create First Note
              </button>
            </div>
          </div>

          <!-- Direct note editor component instead of router outlet -->
          <div *ngIf="selectedNoteId && currentNote" class="editor-container">
            <app-note-editor
              [note]="currentNote"
              (noteChange)="handleNoteChange($event)">
            </app-note-editor>
          </div>
        </div>
      </div>

      <!-- Footer with copyright -->
      <div class="footer">
        <span>cfNote - Secure cloud note taking © 2025</span>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }

    .notes-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: calc(100vh - 64px); /* Full height minus header */
      background-color: var(--bg-color);
      color: var(--text-color);
      box-sizing: border-box;
    }

    .main-layout {
      display: flex;
      flex-direction: row;
      border: none;
      width: 100%;
      flex: 1;
      background-color: var(--bg-color);
      min-height: 0; /* Important for Firefox flex issues */
    }

    .sidebar {
      width: 280px;
      min-width: 280px;
      padding: 20px;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background-color: var(--sidebar-bg-color);
    }

    .sidebar-header {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 16px;
      color: var(--text-color);
    }

    .content-area {
      flex: 1;
      padding: 24px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background-color: var(--card-bg-color);
      width: 100%;
      min-height: 0; /* Important for Firefox flex container */
    }

    .action-btn {
      width: 100%;
      margin-bottom: 16px;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 500;
      background-color: var(--accent-color);
      color: white;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .action-btn:hover:not(:disabled) {
      filter: brightness(110%);
      transform: translateY(-1px);
    }

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .new-note-btn {
      margin-bottom: 20px;
    }

    .loading, .error-message, .empty-state {
      margin-top: 20px;
      text-align: center;
    }

    .error-message {
      color: var(--error-color);
      padding: 10px;
      border-radius: 8px;
      background-color: rgba(var(--error-color-rgb), 0.1);
      border: 1px solid var(--error-color);
    }

    .notes-list {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .note-item {
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--border-color);
      background-color: var(--card-bg-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .note-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 4px var(--card-shadow-color);
    }

    .note-item:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px var(--focus-ring-color);
    }

    .note-title {
      font-weight: 500;
      margin: 0 0 4px 0;
    }

    .note-date {
      font-size: 0.75rem;
      opacity: 0.7;
      margin: 0;
      color: var(--text-muted-color);
    }

    .empty-state {
      padding: 20px;
      color: var(--text-muted-color);
    }

    .empty-title {
      margin-bottom: 8px;
      font-weight: 500;
    }

    .empty-subtitle {
      font-size: 0.75rem;
      opacity: 0.7;
    }

    .welcome-message {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      padding: 40px;
    }

    .welcome-content {
      text-align: center;
      max-width: 500px;
    }

    .welcome-header {
      font-size: 1.875rem;
      font-weight: bold;
      margin-bottom: 16px;
    }

    .welcome-text {
      font-size: 1.125rem;
      margin-bottom: 24px;
      color: var(--text-muted-color);
    }

    .create-first-btn {
      max-width: 200px;
      margin: 0 auto;
    }

    .editor-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .footer {
      text-align: center;
      padding: 8px;
      font-size: 0.75rem;
      color: var(--text-muted-color);
      border-top: 1px solid var(--border-color);
      background-color: var(--bg-color);
    }

    .note-content {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .delete-icon {
      background: none;
      border: none;
      padding: 8px;
      margin-left: 8px;
      cursor: pointer;
      opacity: 0.6;
      border-radius: 4px;
      color: var(--error-color);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .delete-icon:hover {
      opacity: 1;
      background-color: rgba(var(--error-color-rgb), 0.1);
    }

    .icon {
      width: 18px;
      height: 18px;
    }

    .error-note {
      border-left: 4px solid var(--error-color);
    }

    .note-error {
      color: var(--error-color);
      font-size: 0.75rem;
      margin-top: 4px;
    }

    .security-info {
      margin: 24px 0;
      padding: 16px;
      border-radius: 8px;
      background-color: rgba(var(--accent-color-rgb), 0.1);
      border: 1px solid var(--border-color);
      text-align: left;
    }

    .security-header {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 12px;
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

    .active-note {
      border-left: 3px solid var(--accent-color);
      background-color: var(--hover-color);
    }
  `
})
export class NotesListContainerComponent implements OnInit, OnDestroy {
  private noteService = inject(NoteService);
  private cryptoService = inject(CryptoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  notes: PlainNote[] = [];
  loading = true;
  error: string | null = null;
  currentTheme = Theme.LIGHT;
  selectedNoteId: string | null = null;
  currentNote: PlainNote | null = null;
  activeNoteId: string | null = null;

  // For autosave functionality
  private noteChangeSubject = new Subject<PlainNote>();
  private saveSubscription: Subscription | null = null;
  private themeSubscription: Subscription | null = null;
  private routeSubscription: Subscription | null = null;

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    // Watch for route changes to highlight active note
    const parentRoute = this.route.parent || this.route;
    this.routeSubscription = parentRoute.paramMap.subscribe(params => {
      const noteId = params.get('id');
      this.activeNoteId = noteId;

      // If we're navigating back to the notes list (no noteId), reload notes
      if (!noteId) {
        this.loadNotes();
      }
    });

    // Initial load of notes
    this.loadNotes();

    // Watch URL for note ID
    this.route.paramMap.subscribe(params => {
      const noteId = params.get('id');
      if (noteId) {
        this.selectedNoteId = noteId;
        this.loadNoteById(noteId);
      } else {
        this.selectedNoteId = null;
        this.currentNote = null;
      }
    });

    // Set up autosave via debounce
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

    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }

    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private updateUrlWithoutNavigation(): void {
    const url = this.selectedNoteId
      ? `/notes/${this.selectedNoteId}`
      : '/notes';

    // Update the URL without navigation
    window.history.replaceState({}, '', url);
  }

  private async loadNotes(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Get user from auth service
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.router.navigate(['/auth']);
        return;
      }

      // Check if password is set for decryption
      if (!this.cryptoService.hasPassword()) {
        this.router.navigate(['/auth']);
        return;
      }

      // Load encrypted notes
      await this.noteService.loadNotes();
      const encryptedNotes = this.noteService.getNotes();

      // Decrypt notes - handling individual decryption failures
      const decryptedNotes: PlainNote[] = [];

      for (const note of encryptedNotes) {
        try {
          const decryptedNote = await this.cryptoService.decryptNote(note);
          decryptedNotes.push(decryptedNote);
        } catch (error) {
          console.error(`Decryption error for note ${note.id}:`, error);
          // Create an error placeholder for notes that failed to decrypt
          decryptedNotes.push({
            id: note.id,
            title: 'Decryption Failed',
            content: '',
            createdAt: note.createdAt || new Date().toISOString(),
            updatedAt: note.updatedAt || new Date().toISOString(),
            decryptionError: true
          });
        }
      }

      // Sort notes by updatedAt
      this.notes = decryptedNotes.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA; // Descending
      });

      // Update current note if we have a selected note ID
      if (this.selectedNoteId) {
        const selectedNote = this.notes.find(
          note => note.id === this.selectedNoteId
        );
        this.currentNote = selectedNote || null;

        // Don't load notes with decryption errors in the editor
        if (this.currentNote?.decryptionError) {
          this.currentNote = null;
        }
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      this.error = 'Failed to load notes. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async loadNoteById(noteId: string): Promise<void> {
    try {
      // Check if note is already loaded
      const existingNote = this.notes.find(note => note.id === noteId);
      if (existingNote) {
        this.currentNote = existingNote;
        return;
      }

      // Otherwise load from API
      const encryptedNote = await this.noteService.getNote(noteId);
      if (!encryptedNote) {
        throw new Error('Note not found');
      }

      // Decrypt note
      this.currentNote = await this.cryptoService.decryptNote(encryptedNote);
    } catch (error) {
      console.error('Error loading note:', error);
      this.error = 'Failed to load note. Please try again.';
      this.router.navigate(['/notes']);
    }
  }

  viewNote(noteId: string): void {
    // Find the note
    const note = this.notes.find(n => n.id === noteId);

    // Don't navigate to notes with decryption errors
    if (note?.decryptionError) {
      return;
    }

    this.router.navigate(['/notes', noteId]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);

    // If date is today, show time only
    if (this.isToday(date)) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  getContentPreview(note: PlainNote): string {
    if (!note.content) {
      return 'No content';
    }

    // Strip HTML tags for preview
    const textContent = note.content.replace(/<[^>]*>/g, '');

    // Return up to 100 characters
    return textContent.length > 100
      ? `${textContent.substring(0, 100)}...`
      : textContent;
  }

  getWordCount(note: PlainNote): number {
    if (!note.content) {
      return 0;
    }

    // Strip HTML tags for accurate word count
    const textContent = note.content.replace(/<[^>]*>/g, '');

    // Count words by splitting on whitespace
    return textContent.trim().split(/\s+/).filter(Boolean).length;
  }

  async createNewNote(): Promise<void> {
    const newNote: PlainNote = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '', // Ensure content is an empty string, not undefined
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Save to server first
      await this.saveNoteToServer(newNote);

      // Add to local array
      this.notes = [newNote, ...this.notes];

      // Set as current note
      this.currentNote = newNote;
      this.selectedNoteId = newNote.id;

      // Update URL
      this.router.navigate(['/notes', newNote.id]);
    } catch (error) {
      console.error('Error creating new note:', error);
      this.error = 'Failed to create new note. Please try again.';
    }
  }

  handleNoteChange(noteChanges: Partial<PlainNote>): void {
    if (!this.currentNote || !noteChanges.id) return;

    // Update the current note
    this.currentNote = {
      ...this.currentNote,
      ...noteChanges,
      updatedAt: new Date().toISOString()
    };

    // Update the note in the list
    this.notes = this.notes.map(note =>
      note.id === this.currentNote?.id ? this.currentNote : note
    );

    // Trigger autosave
    this.noteChangeSubject.next(this.currentNote);
  }

  private async saveNoteToServer(note: PlainNote): Promise<void> {
    try {
      // Encrypt the note
      const encryptedNote = await this.cryptoService.encryptNote(note);

      // Check if note exists in the list
      const existingNote = this.notes.find(n => n.id === note.id);

      // Save to the server
      if (existingNote) {
        // Update existing note
        await this.noteService.updateNote(note.id, encryptedNote);
      } else {
        // Create new note
        await this.noteService.createNote(encryptedNote);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      this.error = 'Failed to save note. Please try again.';
    }
  }

  private saveNote(note: PlainNote): void {
    this.saveNoteToServer(note);
  }

  confirmDeleteNote(noteId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      this.deleteNote(noteId);
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      // Delete on server
      await this.noteService.deleteNote(noteId);

      // Remove from local array
      this.notes = this.notes.filter(note => note.id !== noteId);

      // Navigate away if currently viewing
      if (this.selectedNoteId === noteId) {
        this.router.navigate(['/notes']);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      this.error = 'Failed to delete note. Please try again.';
    }
  }

  // Check if a note is the active one
  isActiveNote(noteId: string): boolean {
    return this.activeNoteId === noteId;
  }
}
