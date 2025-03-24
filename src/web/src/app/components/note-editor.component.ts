import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../services/theme.service';
import { Theme } from './theme-selector.component';
import { marked } from 'marked'; // Assuming marked is installed

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
  imports: [CommonModule, FormsModule],
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

      <!-- Formatting toolbar -->
      <div class="editor-toolbar"
        [ngClass]="{
          'bg-light-secondary/50 border-light-secondary': currentTheme === Theme.LIGHT, 
          'bg-dark-secondary/50 border-dark-secondary': currentTheme === Theme.DARK,
          'bg-sepia-secondary/50 border-sepia-secondary': currentTheme === Theme.SEPIA
        }">
        <button
          *ngFor="let btn of toolbarButtons"
          [title]="btn.title"
          class="toolbar-button"
          [ngClass]="{
            'hover:bg-light-hover': currentTheme === Theme.LIGHT,
            'hover:bg-dark-hover': currentTheme === Theme.DARK,
            'hover:bg-sepia-hover': currentTheme === Theme.SEPIA
          }"
          (click)="formatText(btn.command, btn.value)"
        >
          <span class="icon" [innerHTML]="btn.icon"></span>
        </button>
        
        <!-- View mode toggle button -->
        <button
          title="Toggle preview mode"
          class="toolbar-button preview-toggle"
          [ngClass]="{
            'hover:bg-light-hover': currentTheme === Theme.LIGHT,
            'hover:bg-dark-hover': currentTheme === Theme.DARK,
            'hover:bg-sepia-hover': currentTheme === Theme.SEPIA,
            'active': previewMode
          }"
          (click)="togglePreviewMode()"
        >
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9C2.121 6.88 6.608 3 12 3Zm0 16a9.005 9.005 0 0 0 8.777-7 9.005 9.005 0 0 0-17.554 0A9.005 9.005 0 0 0 12 19Zm0-2.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            </svg>
          </span>
        </button>
      </div>

      <!-- Editor or Preview based on mode -->
      <div class="editor-content-wrapper">
        <!-- Markdown Editor (shown when not in preview mode) -->
        <div
          *ngIf="!previewMode"
          class="editor-content"
          [ngClass]="{
            'border-light-secondary focus:border-light-accent': currentTheme === Theme.LIGHT,
            'border-dark-secondary focus:border-dark-accent': currentTheme === Theme.DARK,
            'border-sepia-secondary focus:border-sepia-accent': currentTheme === Theme.SEPIA
          }"
          #editorContent
          contenteditable="true"
          (input)="onContentChange()"
          (blur)="onContentChange()"
          [innerHTML]="content"
        ></div>
        
        <!-- Markdown Preview (shown when in preview mode) -->
        <div
          *ngIf="previewMode"
          class="markdown-preview"
          [ngClass]="{
            'border-light-secondary': currentTheme === Theme.LIGHT,
            'border-dark-secondary': currentTheme === Theme.DARK,
            'border-sepia-secondary': currentTheme === Theme.SEPIA
          }"
          [innerHTML]="renderedMarkdown"
        ></div>
      </div>
      
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

    .editor-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 16px;
      padding: 8px;
      border-radius: 8px;
      border-width: 1px;
      border-style: solid;
    }

    .toolbar-button {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .toolbar-button.active {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .toolbar-button .icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .preview-toggle {
      margin-left: auto;
    }

    .editor-content-wrapper {
      flex: 1;
      position: relative;
      min-height: 300px;
      display: flex;
    }

    .editor-content, .markdown-preview {
      flex: 1;
      padding: 16px;
      border-radius: 8px;
      border-width: 1px;
      border-style: solid;
      overflow-y: auto;
      line-height: 1.6;
      height: 100%;
      min-height: 300px;
    }

    .editor-content:focus {
      outline: none;
    }
    
    /* Style headings in the editor and preview */
    .editor-content h1, .markdown-preview h1 {
      font-size: 1.8rem;
      font-weight: bold;
      margin: 1rem 0;
    }
    
    .editor-content h2, .markdown-preview h2 {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 1rem 0;
    }
    
    .editor-content h3, .markdown-preview h3 {
      font-size: 1.3rem;
      font-weight: bold;
      margin: 1rem 0;
    }
    
    /* Style lists */
    .editor-content ul, .editor-content ol, 
    .markdown-preview ul, .markdown-preview ol {
      margin-left: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .editor-content ul li, .markdown-preview ul li {
      list-style-type: disc;
    }
    
    .editor-content ol li, .markdown-preview ol li {
      list-style-type: decimal;
    }
    
    /* Style blockquotes */
    .editor-content blockquote, .markdown-preview blockquote {
      border-left: 4px solid;
      padding-left: 16px;
      margin: 16px 0;
      font-style: italic;
    }

    /* Style code blocks */
    .editor-content pre, .markdown-preview pre {
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      padding: 12px;
      margin: 12px 0;
      overflow-x: auto;
    }
    
    .editor-content code, .markdown-preview code {
      font-family: monospace;
      padding: 2px 4px;
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    /* Style links */
    .editor-content a, .markdown-preview a {
      color: #3b82f6;
      text-decoration: underline;
    }
    
    /* Word count indicator */
    .word-count {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
      font-size: 0.875rem;
      opacity: 0.6;
    }
  `
})
export class NoteEditorComponent implements AfterViewInit {
  private themeService = inject(ThemeService);
  
  @ViewChild('editorContent') editorContentElement!: ElementRef;

  @Input() set note(value: PlainNote | null) {
    if (value) {
      this._note = value;
      this.title = value.title;
      this.content = value.content;
      this.updateRenderedMarkdown();
    }
  }

  @Output() noteChange = new EventEmitter<Partial<PlainNote>>();

  private _note: PlainNote | null = null;
  title = '';
  content = '';
  currentTheme = Theme.LIGHT;
  Theme = Theme; // Make enum available to template
  previewMode = false;
  renderedMarkdown = '';

  // Toolbar buttons configuration with better icons
  toolbarButtons = [
    { command: 'formatMarkdown', value: '**', title: 'Bold', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 11h4.5a2.5 2.5 0 0 0 0-5H8v5Zm10 4.5a4.501 4.501 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.5 4.5 0 0 1 18 15.5ZM8 13v5h5.5a2.5 2.5 0 0 0 0-5H8Z"/></svg>' },
    { command: 'formatMarkdown', value: '*', title: 'Italic', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15v2Z"/></svg>' },
    { command: 'formatMarkdown', value: '# ', title: 'Heading 1', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13 20h-2v-7H4v7H2V4h2v7h7V4h2v16Zm8-12v12h-2v-9.796l-2 .536V8.67L19.5 8H21Z"/></svg>' },
    { command: 'formatMarkdown', value: '## ', title: 'Heading 2', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2Zm14.5 4a3.75 3.75 0 0 1 2.978 6.03l-.148.18L18.034 18H22v2h-7v-1.556l4.82-5.546a1.75 1.75 0 1 0-3.065-1.292l-.005.144h-2A3.75 3.75 0 0 1 18.5 8Z"/></svg>' },
    { command: 'formatMarkdown', value: '### ', title: 'Heading 3', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22 8v2h-4v2h3v2h-3v4h-2V8h6ZM4 4v7h7V4h2v16h-2v-7H4v7H2V4h2Z"/></svg>' },
    { command: 'formatMarkdown', value: '- ', title: 'Bullet List', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 4h13v2H8V4ZM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM8 11h13v2H8v-2Zm0 7h13v2H8v-2Z"/></svg>' },
    { command: 'formatMarkdown', value: '1. ', title: 'Numbered List', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 4h13v2H8V4ZM5 3v3h1v1H3V6h1V4H3V3h2Zm-2 7h3.25v1.5H5v1h1.5V14H3v-1h1v-.5H3v-1.5h3v-1H3v-1h3.25V7H3v1Zm2 7v2H3v-1h1v-.5H3v-1h2V17Zm2 1h13v2H7v-2Zm0-7h13v2H7v-2Z"/></svg>' },
    { command: 'formatMarkdown', value: '`', title: 'Inline Code', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16.95 8.464l1.414-1.414 4.95 4.95-4.95 4.95-1.414-1.414L20.485 12 16.95 8.464Zm-9.9 0L3.515 12l3.535 3.536-1.414 1.414L.686 12l4.95-4.95L7.05 8.464Z"/></svg>' },
    { command: 'formatMarkdown', value: '```\n\n```', title: 'Code Block', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm1 2v14h16V5H4Zm16 7-3.536 3.536-1.414-1.415L17.172 12 15.05 9.879l1.414-1.415L20 12ZM6.828 12l2.122 2.121-1.414 1.415L4 12l3.536-3.536L8.95 9.88 6.828 12Zm4.416 5H9.116l3.64-10h2.128l-3.64 10Z"/></svg>' },
    { command: 'formatMarkdown', value: '[](url)', title: 'Insert Link', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.364 15.536 16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.878 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414Zm-2.828 2.828-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414Zm-.708-10.607 1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07Z"/></svg>' },
    { command: 'formatMarkdown', value: '> ', title: 'Blockquote', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179Zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179Z"/></svg>' },
  ];

  constructor() {
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngAfterViewInit(): void {
    // Initialize editor content
    if (this.content) {
      this.editorContentElement.nativeElement.innerHTML = this.content;
    }
  }

  /**
   * Toggle between edit and preview modes
   */
  togglePreviewMode(): void {
    this.previewMode = !this.previewMode;
    if (this.previewMode) {
      this.updateRenderedMarkdown();
    }
  }

  /**
   * Update the rendered markdown preview
   */
  updateRenderedMarkdown(): void {
    try {
      this.renderedMarkdown = marked.parse(this.content) as string;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      this.renderedMarkdown = '<p>Error rendering markdown</p>';
    }
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

    this.content = this.editorContentElement.nativeElement.innerHTML;
    this.updateRenderedMarkdown();
    this.emitChange({
      content: this.content
    });
  }

  /**
   * Apply markdown formatting to selected text
   */
  formatMarkdown(format: string): void {
    const selection = window.getSelection();
    if (!selection || !this.editorContentElement) return;
    
    // Get selected text
    const selectedText = selection.toString();
    const range = selection.getRangeAt(0);
    
    // Determine how to apply formatting based on format type
    let formattedText = '';
    
    if (format === '**' || format === '*') {
      // Bold or italic - wrap the selected text
      formattedText = `${format}${selectedText}${format}`;
    } else if (format === '# ' || format === '## ' || format === '### ' || 
               format === '- ' || format === '1. ' || format === '> ') {
      // Line prefixes - ensure it's at the start of the line
      formattedText = `${format}${selectedText}`;
    } else if (format === '`') {
      // Inline code - wrap with backticks
      formattedText = `${format}${selectedText}${format}`;
    } else if (format === '```\n\n```') {
      // Code block - special handling
      formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
    } else if (format === '[](url)') {
      // Link - insert link format and position cursor for URL
      const url = prompt('Enter the URL:', 'https://');
      if (url) {
        formattedText = `[${selectedText}](${url})`;
      } else {
        return; // User cancelled
      }
    }
    
    // Replace the selection with the formatted text
    range.deleteContents();
    const textNode = document.createTextNode(formattedText);
    range.insertNode(textNode);
    
    // Update content and emit changes
    this.onContentChange();
    
    // Focus back on the editor after formatting
    this.editorContentElement.nativeElement.focus();
  }

  /**
   * Apply formatting to selected text
   */
  formatText(command: string, value?: string): void {
    if (command === 'formatMarkdown' && value) {
      this.formatMarkdown(value);
      return;
    }
    
    if (command === 'createLink') {
      const url = prompt('Enter the URL:');
      if (url) {
        document.execCommand(command, false, url);
      }
    } else {
      document.execCommand(command, false, value);
    }

    this.onContentChange();
    // Focus back on the editor after formatting
    this.editorContentElement.nativeElement.focus();
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
