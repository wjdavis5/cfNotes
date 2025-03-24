import { Component, Input, Output, EventEmitter, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../services/theme.service';
import { Theme } from './theme-selector.component';
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
  template: `
    <div class="editor-container">
      <!-- Title input -->
      <input
        type="text"
        [(ngModel)]="title"
        (blur)="onTitleChange()"
        placeholder="Untitled Note"
        class="title-input"
        [ngClass]="{
          'bg-light-bg border-light-secondary focus:border-light-accent': currentTheme === Theme.LIGHT,
          'bg-dark-bg border-dark-secondary focus:border-dark-accent': currentTheme === Theme.DARK,
          'bg-sepia-bg border-sepia-secondary focus:border-sepia-accent': currentTheme === Theme.SEPIA
        }"
      />

      <!-- Quill Editor -->
      <quill-editor
        [(ngModel)]="content"
        (onContentChanged)="onContentChange()"
        [style]="{height: '400px'}"
        [placeholder]="'Start typing...'"
        [modules]="quillModules"
        [ngClass]="{
          'quill-light-theme': currentTheme === Theme.LIGHT,
          'quill-dark-theme': currentTheme === Theme.DARK,
          'quill-sepia-theme': currentTheme === Theme.SEPIA
        }"
      ></quill-editor>

      <!-- Word count indicator -->
      <div class="word-count">
        {{ getWordCount() }} words
      </div>
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
      outline: none;
      width: 100%;
      transition: border-color 0.2s;
    }

    .word-count {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
      font-size: 0.875rem;
      opacity: 0.6;
    }

    /* Light theme */
    .quill-light-theme {
      --quill-bg-color: var(--light-bg);
      --quill-text-color: var(--light-text);
      --quill-border-color: var(--light-secondary);
    }

    /* Dark theme */
    .quill-dark-theme {
      --quill-bg-color: var(--dark-bg);
      --quill-text-color: var(--dark-text);
      --quill-border-color: var(--dark-secondary);
    }

    /* Sepia theme */
    .quill-sepia-theme {
      --quill-bg-color: var(--sepia-bg);
      --quill-text-color: var(--sepia-text);
      --quill-border-color: var(--sepia-secondary);
    }

    /* Apply theme to Quill editor */
    :host ::ng-deep .ql-container {
      background-color: var(--quill-bg-color);
      color: var(--quill-text-color);
      border-color: var(--quill-border-color) !important;
      font-family: inherit;
    }

    :host ::ng-deep .ql-toolbar {
      background-color: var(--quill-bg-color);
      color: var(--quill-text-color);
      border-color: var(--quill-border-color) !important;
    }

    :host ::ng-deep .ql-toolbar button,
    :host ::ng-deep .ql-toolbar .ql-picker {
      color: var(--quill-text-color);
    }

    :host ::ng-deep .ql-toolbar button:hover,
    :host ::ng-deep .ql-toolbar button.ql-active {
      color: var(--quill-text-color);
    }

    :host ::ng-deep .ql-toolbar button .ql-stroke,
    :host ::ng-deep .ql-toolbar .ql-picker-label .ql-stroke {
      stroke: var(--quill-text-color);
    }

    :host ::ng-deep .ql-toolbar button:hover .ql-stroke,
    :host ::ng-deep .ql-toolbar button.ql-active .ql-stroke {
      stroke: var(--quill-text-color);
    }

    :host ::ng-deep .ql-toolbar button .ql-fill,
    :host ::ng-deep .ql-toolbar .ql-picker-label .ql-fill {
      fill: var(--quill-text-color);
    }

    :host ::ng-deep .ql-toolbar button:hover .ql-fill,
    :host ::ng-deep .ql-toolbar button.ql-active .ql-fill {
      fill: var(--quill-text-color);
    }
  `
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

  @Output() noteChange = new EventEmitter<Partial<PlainNote>>();

  private _note: PlainNote | null = null;
  title = '';
  content = '';
  currentTheme = Theme.LIGHT;
  Theme = Theme; // Make enum available to template

  // Configure Quill modules - these will be used if the global config doesn't override them
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  constructor() {
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  /**
   * Handle title changes
   */
  onTitleChange(): void {
    if (!this._note) return;

    this.emitChange({
      title: this.title
    });
  }

  /**
   * Handle content changes
   */
  onContentChange(): void {
    if (!this._note) return;

    this.emitChange({
      content: this.content
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
      ...changes
    });
  }
}
