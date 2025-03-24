import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export enum Theme {
  LIGHT = 'light-theme',
  DARK = 'dark-theme',
  SEPIA = 'sepia-theme',
}

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-selector " >
      <button
        class="theme-button light-button "
        data-label="Light Theme"
        [class.active]="currentTheme === Theme.LIGHT"
        (click)="setTheme(Theme.LIGHT)"
        aria-label="Light theme"
        title="Light theme"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="button-icon">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      </button>

      <button
        class="theme-button dark-button "
        data-label="Dark Theme"
        [class.active]="currentTheme === Theme.DARK"
        (click)="setTheme(Theme.DARK)"
        aria-label="Dark theme"
        title="Dark theme"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="button-icon">
          <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" />
        </svg>
      </button>

      <button
        class="theme-button sepia-button "
        data-label="Sepia Theme"
        [class.active]="currentTheme === Theme.SEPIA"
        (click)="setTheme(Theme.SEPIA)"
        aria-label="Sepia theme"
        title="Sepia theme"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="button-icon">
          <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
        </svg>
      </button>
    </div>
  `,
  styles: `
    .theme-selector {
      display: flex;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 3px;
      gap: 3px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Dark theme specific styles */
    :host-context(.dark-theme) .theme-selector {
      background: rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.05);
    }

    /* Sepia theme specific styles */
    :host-context(.sepia-theme) .theme-selector {
      background: rgba(139, 90, 43, 0.1);
      border-color: rgba(139, 90, 43, 0.1);
    }

    .theme-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #333333;
      opacity: 0.5;
    }

    /* Dark theme button color */
    :host-context(.dark-theme) .theme-button {
      color: #f3f4f6;
    }

    /* Sepia theme button color */
    :host-context(.sepia-theme) .theme-button {
      color: #4b3621;
    }

    .theme-button:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }

    .theme-button.active {
      opacity: 1;
    }

    .light-button.active {
      background-color: rgba(255, 255, 255, 0.9);
      color: #f59e0b;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .dark-button.active {
      background-color: #1e293b;
      color: #60a5fa;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .sepia-button.active {
      background-color: #f8f4e8;
      color: #8b5a2b;
      box-shadow: 0 1px 3px rgba(139, 90, 43, 0.15);
    }

    .button-icon {
      width: 20px;
      height: 20px;
    }
    
    /* Debug styles */
    .debug-element {
      border: 2px dashed #ffcc00 !important;
      position: relative;
    }
    
    .debug-element[data-label]::before {
      content: attr(data-label);
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: #ffcc00;
      color: black;
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 3px;
      z-index: 1000;
      font-weight: bold;
      white-space: nowrap;
    }
  `
})
export class ThemeSelectorComponent {
  @Input() currentTheme = Theme.LIGHT;
  @Output() themeChange = new EventEmitter<Theme>();

  Theme = Theme; // Make enum available to template

  /**
   * Set the active theme
   */
  setTheme(theme: Theme): void {
    if (this.currentTheme !== theme) {
      this.themeChange.emit(theme);
    }
  }
}
