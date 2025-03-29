import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../services/theme.service';
import { Theme } from '../models/theme.model';
import { QuillModule } from 'ngx-quill';

// Placeholder interface until Nx libraries are properly set up
interface PlainNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None, // Important to allow Quill styles to work properly
  template: `
    <div class="editor-container">
      <!-- Title input -->
      <input
        type="text"
        [(ngModel)]="title"
        (blur)="onTitleChange()"
        placeholder="Untitled Note"
        class="title-input"
      />

      <!-- Quill Editor -->
      <quill-editor
        [(ngModel)]="content"
        (onContentChanged)="onContentChange()"
        [style]="{ height: '400px' }"
        [placeholder]="'Start typing...'"
        [modules]="quillModules"
        theme="snow"
        class="themed-quill-editor"
      ></quill-editor>

      <!-- Word count indicator -->
      <div class="word-count">{{ getWordCount() }} words</div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    .editor-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    .title-input {
      font-size: 1.75rem;
      font-weight: bold;
      padding: 12px;
      margin-bottom: 16px;
      border-width: 0 0 2px 0;
      border-style: solid;
      border-color: var(--border-color);
      outline: none;
      width: 100%;
      transition: border-color 0.2s;
      background-color: var(--input-bg-color);
      color: var(--text-color);
    }

    .title-input:focus {
      border-color: var(--accent-color);
    }

    .word-count {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
      font-size: 0.875rem;
      color: var(--text-muted-color);
    }

    /* Apply theme to Quill editor */
    :host ::ng-deep .ql-container {
      background-color: var(--card-bg-color) !important;
      color: var(--text-color) !important;
      border-color: var(--border-color) !important;
      font-family: inherit;
    }

    :host ::ng-deep .ql-toolbar.ql-snow {
      background-color: var(--secondary-color) !important;
      color: var(--text-color) !important;
      border-color: var(--border-color) !important;
    }

    /* Fix button styling */
    :host ::ng-deep .ql-snow .ql-toolbar button,
    :host ::ng-deep .ql-snow .ql-toolbar button.ql-active,
    :host ::ng-deep .ql-snow .ql-toolbar .ql-picker-label.ql-active {
      color: var(--text-color) !important;
    }

    :host ::ng-deep .ql-toolbar button .ql-stroke,
    :host ::ng-deep .ql-toolbar .ql-picker-label .ql-stroke {
      stroke: var(--text-color) !important;
    }

    :host ::ng-deep .ql-toolbar button:hover .ql-stroke,
    :host ::ng-deep .ql-toolbar button.ql-active .ql-stroke,
    :host ::ng-deep .ql-toolbar .ql-picker-label.ql-active .ql-stroke {
      stroke: var(--accent-color) !important;
    }

    :host ::ng-deep .ql-toolbar button .ql-fill,
    :host ::ng-deep .ql-toolbar .ql-picker-label .ql-fill {
      fill: var(--text-color) !important;
    }

    :host ::ng-deep .ql-toolbar button:hover .ql-fill,
    :host ::ng-deep .ql-toolbar button.ql-active .ql-fill {
      fill: var(--accent-color) !important;
    }

    /* Ensure the toolbar buttons are properly visible */
    :host ::ng-deep .ql-formats {
      display: inline-block;
      vertical-align: middle;
      margin-right: 15px;
    }

    :host ::ng-deep .ql-toolbar button {
      padding: 3px 5px;
      height: 28px;
      width: 28px;
      display: inline-block;
    }

    :host ::ng-deep .ql-toolbar button svg {
      width: 18px;
      height: 18px;
    }

    /* Add hover effects for better interaction */
    :host ::ng-deep .ql-snow .ql-toolbar button:hover,
    :host ::ng-deep .ql-snow .ql-toolbar button.ql-active {
      background-color: var(--hover-color);
    }

    /* Dark mode specific adjustments */
    :host-context(.dark-theme) ::ng-deep .ql-snow .ql-toolbar button:hover,
    :host-context(.dark-theme) ::ng-deep .ql-snow .ql-toolbar button.ql-active {
      background-color: rgba(255, 255, 255, 0.1);
    }

    /* Style active formats */
    :host-context(.dark-theme) ::ng-deep .ql-snow .ql-toolbar button.ql-active,
    :host-context(.dark-theme) ::ng-deep .ql-snow .ql-toolbar .ql-picker-label.ql-active,
    :host-context(.dark-theme) ::ng-deep .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
      color: var(--accent-color) !important;
    }

    :host-context(.dark-theme) ::ng-deep .ql-snow .ql-toolbar button.ql-active .ql-stroke,
    :host-context(.dark-theme) ::ng-deep .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke {
      stroke: var(--accent-color) !important;
    }

    :host-context(.dark-theme) ::ng-deep .ql-snow .ql-toolbar button.ql-active .ql-fill,
    :host-context(.dark-theme) ::ng-deep .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill {
      fill: var(--accent-color) !important;
    }

    /* Add specific selection color for the editor that matches the theme */
    :host ::ng-deep .ql-editor ::selection {
      background-color: var(--accent-color);
      color: white;
    }
  `,
})
export class NoteEditorComponent {
  private themeService = inject(ThemeService);

  @Input() set note(value: PlainNote | null) {
    if (value) {
      this._note = value;
      this.title = value.title;
      this.content = value.content;
    }
  }
  get note(): PlainNote | null {
    return this._note;
  }

  @Output() noteChange = new EventEmitter<Partial<PlainNote>>();

  private _note: PlainNote | null = null;
  title = '';
  content = '';

  // Removed currentTheme as it's no longer needed with CSS variables

  // Configure Quill editor modules
  quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  constructor() {
    // No need to subscribe to theme changes as we're using CSS variables
  }

  /**
   * Handle title changes
   */
  onTitleChange(): void {
    if (!this._note) return;

    this.emitChange({
      title: this.title,
    });
  }

  /**
   * Handle content changes
   */
  onContentChange(): void {
    if (!this._note) return;

    this.emitChange({
      content: this.content,
    });
  }

  /**
   * Get word count
   */
  getWordCount(): number {
    if (!this.content) {
      return 0;
    }

    // Strip HTML tags for accurate word count
    const textContent = this.content.replace(/<[^>]*>/g, '');

    // Count words by splitting on whitespace
    return textContent.trim().split(/\s+/).filter(Boolean).length;
  }

  /**
   * Emit note changes to parent component
   */
  private emitChange(changes: Partial<PlainNote>): void {
    this.noteChange.emit({
      id: this._note?.id,
      ...changes,
    });
  }
}
