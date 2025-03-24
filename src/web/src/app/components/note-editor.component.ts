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
        [ngClass]="{
          'bg-light-bg border-light-secondary focus:border-light-accent':
            currentTheme === Theme.LIGHT,
          'bg-dark-bg border-dark-secondary focus:border-dark-accent':
            currentTheme === Theme.DARK,
          'bg-sepia-bg border-sepia-secondary focus:border-sepia-accent':
            currentTheme === Theme.SEPIA
        }"
      />

      <!-- Quill Editor -->
      <quill-editor
        [(ngModel)]="content"
        (onContentChanged)="onContentChange()"
        [style]="{ height: '400px' }"
        [placeholder]="'Start typing...'"
        [modules]="quillModules"
        theme="snow"
        [ngClass]="{
          'quill-light-theme': currentTheme === Theme.LIGHT,
          'quill-dark-theme': currentTheme === Theme.DARK,
          'quill-sepia-theme': currentTheme === Theme.SEPIA
        }"
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
      outline: none;
      width: 100%;
      transition: border-color 0.2s;
      background-color: color-mix(in srgb, var(--card-bg), white 20%);
      color: var(--light-text);


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
      --quill-toolbar-bg-color: #f8f9fa;
      --quill-text-color: var(--light-text);
      --quill-toolbar-text-color: #333333;
      --quill-border-color: var(--light-secondary);

      .ql-toolbar {
        background-color: color-mix(in srgb, var(--light-bg), white 20%);
        color: var(--light-text);
      }
    }

    /* Dark theme */
    .quill-dark-theme {
      --quill-bg-color: var(--dark-bg);
      --quill-text-color: var(--dark-text);
      --quill-border-color: var(--dark-secondary);

      .ql-toolbar {
        background-color: color-mix(in srgb, var(--dark-bg), white 20%);
        color: white;
      }

    }

    /* Sepia theme */
    .quill-sepia-theme {
      --quill-bg-color: var(--sepia-bg);
      --quill-toolbar-bg-color: #f3efe5;
      --quill-text-color: var(--sepia-text);
      --quill-toolbar-text-color: #4b3621;
      --quill-border-color: var(--sepia-secondary);

      .ql-toolbar {
        background-color: color-mix(in srgb, var(--dark-bg), white 20%);
        color: white;
      }
    }

    /* Apply theme to Quill editor */
    :host ::ng-deep .ql-container {
      background-color: var(--quill-bg-color) !important;
      color: var(--quill-text-color) !important;
      border-color: var(--quill-border-color) !important;
      font-family: inherit;
    }

    :host ::ng-deep .ql-toolbar.ql-snow {
      background-color: var(--quill-toolbar-bg-color) !important;
      color: var(--quill-toolbar-text-color) !important;
      border-color: var(--quill-border-color) !important;
    }

    /* Fix button styling */
    :host ::ng-deep .ql-snow .ql-toolbar button,
    :host ::ng-deep .ql-snow .ql-toolbar button.ql-active,
    :host ::ng-deep .ql-snow .ql-toolbar .ql-picker-label.ql-active {
      color: var(--quill-toolbar-text-color) !important;
    }

    :host ::ng-deep .ql-toolbar button .ql-stroke,
    :host ::ng-deep .ql-toolbar .ql-picker-label .ql-stroke {
      stroke: var(--quill-toolbar-text-color) !important;
    }

    :host ::ng-deep .ql-toolbar button:hover .ql-stroke,
    :host ::ng-deep .ql-toolbar button.ql-active .ql-stroke,
    :host ::ng-deep .ql-toolbar .ql-picker-label.ql-active .ql-stroke {
      stroke: var(--quill-toolbar-text-color) !important;
    }

    :host ::ng-deep .ql-toolbar button .ql-fill,
    :host ::ng-deep .ql-toolbar .ql-picker-label .ql-fill {
      fill: var(--quill-toolbar-text-color) !important;
    }

    :host ::ng-deep .ql-toolbar button:hover .ql-fill,
    :host ::ng-deep .ql-toolbar button.ql-active .ql-fill {
      fill: var(--quill-toolbar-text-color) !important;
    }

    /* Make dark theme more visible */
    .quill-dark-theme ::ng-deep .ql-toolbar.ql-snow {
      background-color: #3a4d6d !important;
    }

    .quill-dark-theme ::ng-deep .ql-container.ql-snow {
      background-color: #263247 !important;
    }

    .quill-dark-theme ::ng-deep .ql-toolbar .ql-stroke {
      stroke: #ffffff !important;
    }

    .quill-dark-theme ::ng-deep .ql-toolbar .ql-fill {
      fill: #ffffff !important;
    }

    .quill-dark-theme ::ng-deep .ql-toolbar button {
      color: #ffffff !important;
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
      background-color: rgba(0, 0, 0, 0.05);
    }

    .quill-dark-theme ::ng-deep .ql-snow .ql-toolbar button:hover,
    .quill-dark-theme ::ng-deep .ql-snow .ql-toolbar button.ql-active {
      background-color: rgba(255, 255, 255, 0.1);
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
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  constructor() {
    this.themeService.currentTheme$.subscribe((theme) => {
      this.currentTheme = theme;
    });
  }

  /**
   * Handle title changes
   */
  onTitleChange(): void {
    if (!this._note) return;

    console.log('Title changed:', this.title);
    this.emitChange({
      title: this.title,
    });
  }

  /**
   * Handle content changes
   */
  onContentChange(): void {
    if (!this._note) return;

    console.log('Content changed:', this.content);
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
    console.log('Emitting changes:', changes);
    this.noteChange.emit({
      id: this._note?.id,
      ...changes,
    });
  }
}
