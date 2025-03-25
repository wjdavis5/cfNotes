import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import { Theme } from '../models/theme.model';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="note-card themed-card"
      (click)="onSelect()"
      (keydown.enter)="onSelect()"
      (keydown.space)="onSelect()"
      tabindex="0"
      role="button"
      [attr.aria-label]="'Select note: ' + (note.title || 'Untitled Note')"
    >
      <div class="note-header">
        <h3 class="note-title">{{ note.title || 'Untitled Note' }}</h3>
        <button
          class="delete-button"
          (click)="onDeleteClick($event)"
          aria-label="Delete note"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="delete-icon">
            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <div class="note-content">
        <p class="content-preview">{{ getContentPreview() }}</p>
      </div>
      <div class="note-footer">
        <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
        <span class="word-count">{{ getWordCount() }} words</span>
      </div>
    </div>
  `,
  styles: `
    .note-card {
      display: flex;
      flex-direction: column;
      padding: 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      height: 100%;
      min-height: 150px;
      outline: none; /* Remove default focus outline */
    }

    .note-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px var(--card-shadow-color);
    }

    .note-card:focus-visible {
      box-shadow: 0 0 0 2px var(--focus-ring-color);
      transform: translateY(-2px);
    }

    .note-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .note-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: var(--text-color);
      word-break: break-word;
    }

    .delete-button {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      margin: -4px;
      border-radius: 4px;
      opacity: 0.5;
      color: var(--text-color);
      transition: all 0.2s ease;
    }

    .delete-button:hover {
      opacity: 1;
      background-color: var(--hover-color);
    }

    .delete-button:focus-visible {
      opacity: 1;
      outline: none;
      box-shadow: 0 0 0 2px var(--focus-ring-color);
    }

    .delete-icon {
      width: 16px;
      height: 16px;
    }

    .note-content {
      flex: 1;
      overflow: hidden;
    }

    .content-preview {
      font-size: 14px;
      color: var(--text-muted-color);
      margin: 0;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      line-height: 1.5;
    }

    .note-footer {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-muted-color);
      margin-top: 8px;
    }
  `
})
export class NoteCardComponent {
  @Input() note!: Note;
  @Output() selectNote = new EventEmitter<string>();
  @Output() deleteNote = new EventEmitter<string>();

  private themeService = inject(ThemeService);

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
