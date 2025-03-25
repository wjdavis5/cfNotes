import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, lastValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

// Temporary interfaces until properly set up with Nx
interface Note {
  id: string;
  title: string;
  encryptedContent: string;
  content?: string; // Add optional content field for API compatibility
  iv: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

interface PlainNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesResponse {
  notes: Note[];
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly API_URL = '/api/notes';

  // Notes state
  private notesSubject = new BehaviorSubject<Note[]>([]);
  notes$ = this.notesSubject.asObservable();

  // Current note being edited
  private currentNoteSubject = new BehaviorSubject<PlainNote | null>(null);
  currentNote$ = this.currentNoteSubject.asObservable();

  /**
   * Load user's notes
   */
  async loadNotes(): Promise<Note[]> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return [];
    }

    try {
      const url = `${this.API_URL}/${user.emailHash}`;
      const response = await lastValueFrom(
        this.http.get<NotesResponse>(url).pipe(
          catchError(error => {
            console.error('Error loading notes:', error);
            return of({ notes: [] });
          })
        )
      );

      this.notesSubject.next(response.notes);
      return response.notes;
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  }

  /**
   * Get a specific note
   */
  async getNote(noteId: string): Promise<Note | null> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return null;
    }

    try {
      const url = `${this.API_URL}/${user.emailHash}/${noteId}`;
      return await lastValueFrom(
        this.http.get<Note>(url).pipe(
          catchError(error => {
            console.error('Error getting note:', error);
            return of(null);
          })
        )
      );
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  }

  /**
   * Create a new note
   */
  async createNote(note: Partial<Note>): Promise<Note | null> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return null;
    }

    try {
      const url = `${this.API_URL}/${user.emailHash}`;
      const response = await lastValueFrom(
        this.http.post<{ success: boolean; note: Note }>(url, note).pipe(
          catchError(error => {
            console.error('Error creating note:', error);
            return of({ success: false, note: null as unknown as Note });
          })
        )
      );

      if (response.success && response.note) {
        // Update state with new note
        const currentNotes = this.notesSubject.value;
        this.notesSubject.next([...currentNotes, response.note]);
        return response.note;
      }

      return null;
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  }

  /**
   * Update a note
   */
  async updateNote(noteId: string, updatedNote: Partial<Note>): Promise<Note | null> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return null;
    }

    try {
      const url = `${this.API_URL}/${user.emailHash}/${noteId}`;
      const response = await lastValueFrom(
        this.http.put<{ success: boolean; note: Note }>(url, updatedNote).pipe(
          catchError(error => {
            console.error('Error updating note:', error);
            return of({ success: false, note: null as unknown as Note });
          })
        )
      );

      if (response.success && response.note) {
        // Update notes in state
        const currentNotes = this.notesSubject.value;
        const updatedNotes = currentNotes.map(note =>
          note.id === noteId ? response.note : note
        );
        this.notesSubject.next(updatedNotes);
        return response.note;
      }

      return null;
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return false;
    }

    try {
      const url = `${this.API_URL}/${user.emailHash}/${noteId}`;
      const response = await lastValueFrom(
        this.http.delete<{ success: boolean }>(url).pipe(
          catchError(error => {
            console.error('Error deleting note:', error);
            return of({ success: false });
          })
        )
      );

      if (response.success) {
        // Remove note from state
        const currentNotes = this.notesSubject.value;
        const updatedNotes = currentNotes.filter(note => note.id !== noteId);
        this.notesSubject.next(updatedNotes);

        // Clear current note if it's the one being deleted
        const currentNote = this.currentNoteSubject.value;
        if (currentNote && currentNote.id === noteId) {
          this.currentNoteSubject.next(null);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }

  /**
   * Set current note
   */
  setCurrentNote(note: PlainNote | null): void {
    this.currentNoteSubject.next(note);
  }

  /**
   * Get current notes
   */
  getNotes(): Note[] {
    return this.notesSubject.value;
  }

  /**
   * Clear all notes data (used during logout)
   */
  clearNotes(): void {
    this.notesSubject.next([]);
    this.currentNoteSubject.next(null);
  }

  /**
   * Fix notes that might be missing the salt field
   */
  async fixNotes(): Promise<{
    stats: {
      total: number;
      fixed: number;
      alreadyValid: number;
      failed: number;
    };
    fixedNotes: string[];
  }> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await lastValueFrom(
        this.http
          .post<{
            success: boolean;
            stats: {
              total: number;
              fixed: number;
              alreadyValid: number;
              failed: number;
            };
            fixedNotes: string[];
            alreadyValid: string[];
            failedFixes: Array<{ key: string; reason: string }>;
          }>(`${this.API_URL}/${user.emailHash}/fix-notes`, {})
          .pipe(
            catchError((error) => {
              console.error('Error fixing notes:', error);
              throw new Error('Failed to fix notes');
            })
          )
      );

      if (!response.success) {
        throw new Error('Failed to fix notes');
      }

      return {
        stats: response.stats,
        fixedNotes: response.fixedNotes
      };
    } catch (error) {
      console.error('Error in fixNotes:', error);
      throw error;
    }
  }
}
