import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NoteCardComponent } from '../../components/note-card.component';
import { NoteService } from '../../services/note.service';
import { CryptoService } from '../../services/crypto.service';
import { ThemeService } from '../../services/theme.service';
import { Theme } from '../../components/theme-selector.component';
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
}

@Component({
  selector: 'app-notes-list-container',
  standalone: true,
  imports: [CommonModule, RouterModule, NoteEditorComponent],
  template: `
    <!-- Full page container -->
    <div class="notes-container">
      <!-- Debug header - will hide this after final testing -->
      
      
      <!-- Main layout - now with border radius -->
      <div class="main-layout" [ngClass]="{
        'theme-light': currentTheme === Theme.LIGHT,
        'theme-dark': currentTheme === Theme.DARK,
        'theme-sepia': currentTheme === Theme.SEPIA
      }">
        <!-- Left sidebar with border radius -->
        <div class="sidebar">
          <h2 class="sidebar-header">My Notes</h2>
          
          <!-- Theme-aware New Note Button -->
          <button
            class="action-btn new-note-btn"
            (click)="createNewNote()"
            [ngClass]="{
              'btn-light': currentTheme === Theme.LIGHT,
              'btn-dark': currentTheme === Theme.DARK,
              'btn-sepia': currentTheme === Theme.SEPIA
            }"
          >
            New Note
          </button>
          
          <!-- Fix Notes Button (for migration) -->
          <button
            *ngIf="showFixButton"
            class="action-btn fix-notes-btn"
            (click)="fixNotes()"
            [ngClass]="{
              'btn-light': currentTheme === Theme.LIGHT,
              'btn-dark': currentTheme === Theme.DARK,
              'btn-sepia': currentTheme === Theme.SEPIA
            }"
            [disabled]="isFixingNotes"
          >
            {{ isFixingNotes ? 'Fixing Notes...' : 'Fix Encryption' }}
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
                 (click)="viewNote(note.id)"
                 (keydown.enter)="viewNote(note.id)"
                 (keydown.space)="viewNote(note.id)"
                 tabindex="0"
                 role="button"
            >
              <p class="font-medium">{{ note.title || 'Untitled Note' }}</p>
              <p class="text-xs opacity-70">{{ formatDate(note.updatedAt) }}</p>
            </div>
          </div>
          
          <!-- Empty State -->
          <div *ngIf="!loading && !error && notes.length === 0" class="empty-state">
            <p class="mb-2">No notes yet</p>
            <p class="text-xs opacity-70">Create your first note to get started</p>
          </div>
        </div>
        
        <!-- Main content area with border radius -->
        <div class="content-area" id="content-area">
          <!-- Welcome message when no note selected -->
          <div *ngIf="!selectedNoteId" class="welcome-message">
            <div class="text-center">
              <h2 class="welcome-header">Welcome to cfNote</h2>
              <p class="welcome-text">Select a note or create a new one to get started</p>
              
              <button
                *ngIf="notes.length === 0"
                class="action-btn create-first-btn"
                (click)="createNewNote()"
                [ngClass]="{
                  'btn-light': currentTheme === Theme.LIGHT,
                  'btn-dark': currentTheme === Theme.DARK,
                  'btn-sepia': currentTheme === Theme.SEPIA
                }"
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
      <div class="footer" [ngClass]="{
        'footer-light': currentTheme === Theme.LIGHT,
        'footer-dark': currentTheme === Theme.DARK,
        'footer-sepia': currentTheme === Theme.SEPIA
      }">
        <span>cfNote - Secure cloud note taking © 2025</span>
      </div>
    </div>
  `,
  styles: `
    .notes-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: calc(100vh - 64px); /* Full height minus header */
      gap: 16px;
    }
    
    .debug-header {
      background-color: #ef4444;
      color: white;
      padding: 10px;
      margin-bottom: 8px;
      border-radius: 8px;
      text-align: center;
    }
    
    .main-layout {
      display: flex !important;
      flex-direction: row !important;
      border: 1px solid;
      border-radius: 12px;
      overflow: hidden;
      width: 100%;
      flex: 1;
    }
    
    .theme-light {
      border-color: #d1d5db;
      background-color: #f9fafb;
      color: #111827;
    }
    
    .theme-dark {
      border-color: #4b5563;
      background-color: #1f2937;
      color: #f9fafb;
    }
    
    .theme-sepia {
      border-color: #d6d3d1;
      background-color: #fef3c7;
      color: #78350f;
    }
    
    .sidebar {
      width: 280px !important;
      min-width: 280px !important;
      padding: 20px;
      border-right: 1px solid;
      border-right-color: inherit;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    
    .sidebar-header {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 16px;
    }
    
    .content-area {
      flex: 1;
      padding: 24px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    
    .action-btn {
      width: 100%;
      margin-bottom: 16px;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 500;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .new-note-btn {
      margin-bottom: 20px;
    }
    
    .btn-light {
      background-color: #3b82f6;
    }
    
    .btn-light:hover {
      background-color: #2563eb;
    }
    
    .btn-dark {
      background-color: #60a5fa;
    }
    
    .btn-dark:hover {
      background-color: #3b82f6;
    }
    
    .btn-sepia {
      background-color: #b45309;
    }
    
    .btn-sepia:hover {
      background-color: #92400e;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      padding: 16px 0;
    }
    
    .error-message {
      padding: 12px;
      margin: 12px 0;
      border-radius: 8px;
      background-color: #ef4444;
      color: white;
      border: 1px solid #dc2626;
    }
    
    .notes-list {
      overflow-y: auto;
      margin-top: 8px;
    }
    
    .note-item {
      margin-bottom: 12px;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid;
      border-color: inherit;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .note-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .empty-state {
      text-align: center;
      padding: 20px;
    }
    
    .welcome-message {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    
    .welcome-header {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 12px;
    }
    
    .welcome-text {
      margin-bottom: 24px;
    }
    
    .create-first-btn {
      display: inline-block;
      width: auto;
      padding: 12px 24px;
    }
    
    .editor-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
    
    app-note-editor {
      flex: 1;
      display: flex;
      height: 100%;
      min-height: 500px;
    }
    
    .footer {
      padding: 12px;
      text-align: center;
      font-size: 0.875rem;
      border-radius: 8px;
    }
    
    .footer-light {
      background-color: #f3f4f6;
      color: #6b7280;
    }
    
    .footer-dark {
      background-color: #374151;
      color: #9ca3af;
    }
    
    .footer-sepia {
      background-color: #fef3c7;
      color: #92400e;
    }
    
    .fix-notes-btn {
      margin-bottom: 16px;
      background-color: #fb923c;
    }
    
    .fix-notes-btn:hover {
      background-color: #f97316;
    }
    
    .fix-notes-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `
})
export class NotesListContainerComponent implements OnInit, OnDestroy {
  private noteService = inject(NoteService);
  private cryptoService = inject(CryptoService);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  notes: PlainNote[] = [];
  loading = true;
  error: string | null = null;
  currentTheme = Theme.LIGHT;
  Theme = Theme; // Make enum available to template
  selectedNoteId: string | null = null;
  currentNote: PlainNote | null = null;

  // Add subject for debouncing note changes
  private noteChangeSubject = new Subject<PlainNote>();
  private saveSubscription: Subscription | null = null;

  // Properties for fix functionality
  showFixButton = false;
  isFixingNotes = false;

  ngOnInit(): void {
    console.log('NotesListContainerComponent initialized'); // Debug log
    this.loadNotes();
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
    
    // Set up crypto service with user password (in real app, this would be from secure storage)
    // This is a dummy password for demonstration purposes only
    const user = this.authService.getCurrentUser();
    if (user) {
      // In a real app, this would be from a secure key vault or user input
      this.cryptoService.setPassword('defaultPassword');
    }
    
    // Update URL to reflect current note but don't navigate
    this.updateUrlWithoutNavigation();
    
    // Set up debounced save
    this.saveSubscription = this.noteChangeSubject.pipe(
      debounceTime(1000) // Wait 1 second after changes stop
    ).subscribe(note => {
      this.saveNoteToServer(note);
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.saveSubscription) {
      this.saveSubscription.unsubscribe();
    }
  }

  /**
   * Update URL without triggering navigation
   */
  private updateUrlWithoutNavigation(): void {
    if (this.selectedNoteId) {
      window.history.replaceState(
        {}, 
        '', 
        `/notes/${this.selectedNoteId}`
      );
    }
  }

  /**
   * Load and decrypt notes
   */
  async loadNotes(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Load encrypted notes
      const encryptedNotes = await this.noteService.loadNotes();
      console.log('Loaded encrypted notes:', encryptedNotes.length); 
      
      // Debug the structure of the first note if available
      if (encryptedNotes.length > 0) {
        const sampleNote = encryptedNotes[0];
        console.debug('Sample note structure:', {
          id: sampleNote.id,
          title: sampleNote.title,
          hasIV: !!sampleNote.iv,
          hasSalt: !!sampleNote.salt,
          encryptedContentLength: sampleNote.encryptedContent?.length || 0
        });
        
        // Show fix button if any note is missing salt
        this.showFixButton = encryptedNotes.some(note => !note.salt);
      }

      if (!encryptedNotes.length) {
        this.notes = [];
        this.loading = false;
        return;
      }

      // Ensure password is set for decryption
      if (!this.cryptoService.hasPassword()) {
        console.warn('No crypto password set, setting default password');
        // For demo purposes - in a real app this would come from user input
        this.cryptoService.setPassword('defaultPassword');
      }

      // Try to decrypt notes
      try {
        this.notes = await this.cryptoService.decryptNotes(encryptedNotes);
        console.log('Successfully decrypted notes:', this.notes.length);
        
        // Check how many notes were successfully decrypted vs failed
        const failedNotes = this.notes.filter(note => note.content === 'Unable to decrypt content').length;
        if (failedNotes > 0) {
          console.warn(`${failedNotes} out of ${this.notes.length} notes could not be decrypted`);
          // Still show the notes but with a warning
          this.error = 'Some notes could not be decrypted. They may have been encrypted with a different password.';
          setTimeout(() => this.error = null, 5000);
        }
      } catch (decryptError) {
        console.error('Error during note decryption:', decryptError);
        
        // Show partially decrypted notes if possible
        if (this.notes.length > 0) {
          this.error = 'Error decrypting notes. Some notes may not be readable.';
        } else {
          // No notes could be decrypted
          throw new Error('Failed to decrypt any notes');
        }
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      this.error = 'Failed to load notes. Please try logging in again.';
      this.notes = [];
    } finally {
      this.loading = false;
    }
  }

  /**
   * Load a note by ID
   */
  async loadNoteById(noteId: string): Promise<void> {
    try {
      // First try to find the note in the already loaded notes
      const note = this.notes.find(n => n.id === noteId);
      if (note) {
        console.debug(`Found note ${noteId} in loaded notes`);
        this.currentNote = note;
        return;
      }
      
      console.debug(`Note ${noteId} not found in loaded notes, fetching from API`);
      // If note not found in current list, try to fetch it from the API
      const fetchedNote = await this.noteService.getNote(noteId);
      
      if (!fetchedNote) {
        console.error(`Note ${noteId} not found in API`);
        throw new Error('Note not found');
      }
      
      console.debug(`Retrieved note ${noteId} from API, attempting to decrypt`);
      // Log the structure of the fetched note
      console.debug('Fetched note structure:', {
        id: fetchedNote.id,
        title: fetchedNote.title,
        hasIV: !!fetchedNote.iv,
        hasSalt: !!fetchedNote.salt,
        encryptedContentLength: fetchedNote.encryptedContent?.length || 0
      });
      
      // Ensure we have a password set
      if (!this.cryptoService.hasPassword()) {
        console.warn('No crypto password set, setting default password');
        // For demo purposes - in a real app this would come from user input
        this.cryptoService.setPassword('defaultPassword');
      }
      
      try {
        // Attempt to decrypt the note
        this.currentNote = await this.cryptoService.decryptNote(fetchedNote);
        console.debug(`Successfully decrypted note ${noteId}`);
      } catch (decryptError) {
        console.error(`Failed to decrypt note ${noteId}:`, decryptError);
        // Still display the note but with unreadable content
        this.currentNote = {
          id: fetchedNote.id,
          title: fetchedNote.title,
          content: 'Unable to decrypt content. This note may have been encrypted with a different password.',
          createdAt: fetchedNote.createdAt,
          updatedAt: fetchedNote.updatedAt
        };
        
        // Show an error message
        this.error = 'Could not decrypt note content. It may have been encrypted with a different password.';
        setTimeout(() => this.error = null, 5000);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      this.error = 'Failed to load note. Please try again.';
      setTimeout(() => this.error = null, 3000);
    }
  }

  /**
   * View a note - now loads directly in the component
   */
  viewNote(noteId: string): void {
    this.selectedNoteId = noteId;
    this.loadNoteById(noteId);
    this.updateUrlWithoutNavigation();
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);

    // If date is today, show time only
    if (this.isToday(date)) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  /**
   * Check if date is today
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Get a preview of the note content
   */
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
  
  /**
   * Get word count
   */
  getWordCount(note: PlainNote): number {
    if (!note.content) {
      return 0;
    }
    
    // Strip HTML tags for accurate word count
    const textContent = note.content.replace(/<[^>]*>/g, '');
    
    // Count words by splitting on whitespace
    return textContent.trim().split(/\s+/).filter(Boolean).length;
  }

  /**
   * Create a new note - now creates and displays directly
   */
  createNewNote(): void {
    // Generate a temporary ID for the new note
    const tempId = crypto.randomUUID();

    // Set up a new empty note
    const newNote: PlainNote = {
      id: tempId,
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to notes list
    this.notes = [newNote, ...this.notes];
    
    // Set as current note
    this.noteService.setCurrentNote(newNote);
    this.selectedNoteId = tempId;
    this.currentNote = newNote;
    
    // Update URL without navigation
    this.updateUrlWithoutNavigation();
  }

  /**
   * Handle note changes from the editor
   */
  handleNoteChange(noteChanges: Partial<PlainNote>): void {
    if (!noteChanges.id || !this.currentNote) return;
    
    // Update the current note
    this.currentNote = {
      ...this.currentNote,
      ...noteChanges,
      updatedAt: new Date().toISOString()
    };
    
    // Update in the notes list
    this.notes = this.notes.map(note => 
      note.id === this.currentNote?.id ? this.currentNote : note
    );
    
    // Queue debounced save
    this.noteChangeSubject.next(this.currentNote);
  }
  
  /**
   * Save note changes (debounced version)
   */
  private async saveNoteToServer(note: PlainNote): Promise<void> {
    try {
      // First, we need to determine if this is a new note or an existing one
      const isNewNote = !this.notes.some(n => n.id === note.id && n !== this.currentNote);
      
      // Ensure content is set, defaulting to empty string if undefined
      const content = note.content || '';
      
      // Check if CryptoService has a password set
      if (!this.cryptoService.hasPassword()) {
        console.warn('No password set in CryptoService, using plain text storage');
        
        // Fall back to unencrypted storage but include ALL required fields
        if (isNewNote) {
          await this.noteService.createNote({
            id: note.id,
            title: note.title,
            content: content,
            encryptedContent: "******# Unable to decrypt content- ", // Placeholder
            iv: 'dummy-iv',
            salt: 'dummy-salt', // Make sure salt is included even for unencrypted notes
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
          });
        } else {
          await this.noteService.updateNote(note.id, {
            title: note.title,
            content: content,
            encryptedContent: "******# Unable to decrypt content- ", // Placeholder
            iv: 'dummy-iv',
            salt: 'dummy-salt', // Make sure salt is included even for unencrypted notes
            updatedAt: note.updatedAt
          });
        }
        return;
      }
      
      // Actually encrypt the note using CryptoService
      const encryptedNote = await this.cryptoService.encryptNote(note);
      
      // Check that all required fields are present to avoid decryption issues
      if (!encryptedNote.salt) {
        console.error('Missing salt in encrypted note - this will cause decryption to fail');
        throw new Error('Missing required encryption fields');
      }
      
      if (isNewNote) {
        // Create a new note with properly encrypted content
        await this.noteService.createNote({
          id: note.id,
          title: note.title,
          content: content, // For API validation
          encryptedContent: encryptedNote.encryptedContent,
          iv: encryptedNote.iv,
          salt: encryptedNote.salt, // Ensure salt is sent to server
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        });
        console.debug(`Created note ${note.id} with salt value present: ${!!encryptedNote.salt}`);
      } else {
        // Update existing note with properly encrypted content
        await this.noteService.updateNote(note.id, {
          title: note.title,
          content: content, // For API validation
          encryptedContent: encryptedNote.encryptedContent,
          iv: encryptedNote.iv,
          salt: encryptedNote.salt, // Ensure salt is sent to server
          updatedAt: note.updatedAt
        });
        console.debug(`Updated note ${note.id} with salt value present: ${!!encryptedNote.salt}`);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      this.error = 'Failed to save note. Please try again.';
      setTimeout(() => this.error = null, 3000);
    }
  }

  /**
   * Replace old saveNote method
   */
  private saveNote(note: PlainNote): void {
    this.noteChangeSubject.next(note);
  }

  /**
   * Confirm deletion of a note
   */
  confirmDeleteNote(noteId: string): void {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      this.deleteNote(noteId);
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    try {
      await this.noteService.deleteNote(noteId);
      this.notes = this.notes.filter(note => note.id !== noteId);
      
      // If the deleted note was selected, clear selection
      if (this.selectedNoteId === noteId) {
        this.selectedNoteId = null;
        this.currentNote = null;
        
        // Update URL
        window.history.replaceState({}, '', '/notes');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      // Show error notification
      this.error = 'Failed to delete note. Please try again.';
      setTimeout(() => this.error = null, 3000);
    }
  }

  /**
   * Fix notes with missing salt
   */
  async fixNotes(): Promise<void> {
    if (this.isFixingNotes) return;
    
    this.isFixingNotes = true;
    this.error = null;
    
    try {
      const result = await this.noteService.fixNotes();
      console.log('Fix notes result:', result);
      
      if (result.stats.fixed > 0) {
        // Show success message
        this.error = `Successfully fixed ${result.stats.fixed} notes. Reloading...`;
        setTimeout(() => {
          this.error = null;
          // Reload notes to get updated data
          this.loadNotes();
        }, 2000);
      } else {
        this.error = 'No notes needed fixing';
        setTimeout(() => this.error = null, 3000);
      }
      
      // Hide the fix button if no more notes need fixing
      if (result.stats.fixed > 0 && result.stats.failed === 0) {
        this.showFixButton = false;
      }
    } catch (error) {
      console.error('Error fixing notes:', error);
      this.error = 'Failed to fix notes. Please try again.';
      setTimeout(() => this.error = null, 3000);
    } finally {
      this.isFixingNotes = false;
    }
  }
}
