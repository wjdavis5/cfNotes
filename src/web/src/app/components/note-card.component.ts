import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { Theme } from './theme-selector.component';

// Placeholder interface until Nx libraries are properly set up
interface PlainNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <h1>TEST</h1>
    <div
      class="group bg-opacity-50 border rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full"
      [ngClass]="{
        'bg-white border-light-secondary hover:shadow-lg hover:border-light-accent text-light-text': currentTheme === Theme.LIGHT,
        'bg-dark-secondary/40 border-dark-secondary hover:shadow-lg hover:border-dark-accent text-dark-text': currentTheme === Theme.DARK,
        'bg-sepia-secondary/30 border-sepia-secondary hover:shadow-lg hover:border-sepia-accent text-sepia-text': currentTheme === Theme.SEPIA
      }"
      (click)="onSelect()"
      (keydown.enter)="onSelect()"
      (keydown.space)="onSelect()"
      tabindex="0"
      role="button"
      [attr.aria-label]="'Select note: ' + (note.title || 'Untitled Note')"
    >
      <div class="p-5 flex-grow">
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-lg font-semibold line-clamp-2"
              [ngClass]="{
                'text-light-text': currentTheme === Theme.LIGHT,
                'text-dark-text': currentTheme === Theme.DARK,
                'text-sepia-text': currentTheme === Theme.SEPIA
              }">{{ note.title || 'Untitled Note' }}</h3>
          <button
            *ngIf="allowDelete"
            class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full -mt-1 -mr-1"
            [ngClass]="{
              'hover:bg-red-100 text-red-500': currentTheme === Theme.LIGHT,
              'hover:bg-red-900/30 text-red-400': currentTheme === Theme.DARK,
              'hover:bg-red-100/50 text-red-700': currentTheme === Theme.SEPIA
            }"
            (click)="onDeleteClick($event)"
            aria-label="Delete note"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <p class="text-sm line-clamp-3 mb-4"
          [ngClass]="{
            'text-light-text/70': currentTheme === Theme.LIGHT,
            'text-dark-text/70': currentTheme === Theme.DARK,
            'text-sepia-text/70': currentTheme === Theme.SEPIA
          }">
          {{ getContentPreview() }}
        </p>
      </div>
      
      <div class="flex justify-between items-center px-5 py-3 text-xs"
        [ngClass]="{
          'bg-light-secondary/50 text-light-text/60': currentTheme === Theme.LIGHT,
          'bg-dark-secondary/70 text-dark-text/60': currentTheme === Theme.DARK,
          'bg-sepia-secondary/50 text-sepia-text/60': currentTheme === Theme.SEPIA
        }">
        <span>{{ formatDate(note.updatedAt) }}</span>
        <span>{{ getWordCount() }} words</span>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    
    /* Enhance line clamping for content preview */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `
})
export class NoteCardComponent {
  private themeService = inject(ThemeService);
  
  @Input({ required: true }) note!: PlainNote;
  @Input() selected = false;
  @Input() allowDelete = true;

  @Output() selectNote = new EventEmitter<string>();
  @Output() deleteNote = new EventEmitter<string>();
  
  currentTheme = Theme.LIGHT;
  Theme = Theme; // Make enum available to template
  
  constructor() {
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  /**
   * Handle card selection
   */
  onSelect(): void {
    this.selectNote.emit(this.note.id);
  }

  /**
   * Handle note deletion
   */
  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation(); // Prevent card selection
    this.deleteNote.emit(this.note.id);
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
  getContentPreview(): string {
    if (!this.note.content) {
      return 'No content';
    }

    // Strip HTML tags for preview
    const textContent = this.note.content.replace(/<[^>]*>/g, '');

    // Return up to 150 characters
    return textContent.length > 150
      ? `${textContent.substring(0, 150)}...`
      : textContent;
  }
  
  /**
   * Get word count
   */
  getWordCount(): number {
    if (!this.note.content) {
      return 0;
    }
    
    // Strip HTML tags for accurate word count
    const textContent = this.note.content.replace(/<[^>]*>/g, '');
    
    // Count words by splitting on whitespace
    return textContent.trim().split(/\s+/).filter(Boolean).length;
  }
}
