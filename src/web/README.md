# cfNote Web UI

This README documents UI customizations and important implementation details for the cfNote web application.

## Security Features

cfNote implements several advanced security features to ensure your data remains private and secure:

### Authentication & Encryption

- **Zero-knowledge architecture**: Email addresses are stored only as secure hashes
- **End-to-end encryption**: All notes are encrypted with AES-256 before leaving your browser
- **PBKDF2 key derivation**: Uses 100,000 iterations and SHA-256 for strong encryption keys

### Enhanced Security Measures

- **Secure password storage options**:
  - **Session Storage Mode**: Encryption keys are stored in sessionStorage (cleared when browser closes)
  - **Memory-Only Mode**: Encryption keys are never persisted to browser storage
  - **Re-authentication**: Sensitive operations require password re-entry in Memory-Only Mode

- **Session timeout**: Automatic logout after 30 minutes of inactivity

- **Auto-logout on page exit**: Forces secure cleanup when users navigate away or close the browser

- **CSRF protection**: Implemented using a double-submit cookie pattern 

- **Secure headers**: Content Security Policy and other security headers

### Implementation Notes

- Password storage uses sessionStorage instead of localStorage to mitigate XSS vulnerabilities
- Activity monitoring tracks user interactions to detect when timeout should occur
- CSRF protection adds tokens to all non-GET API requests
- Re-authentication guard prevents access to sensitive routes without valid credentials

## Quill Editor Implementation

The application uses [Quill](https://quilljs.com/) rich text editor via the [ngx-quill](https://github.com/KillerCodeMonkey/ngx-quill) wrapper for Angular.

### Toolbar Customization

The Quill toolbar has been customized with the following features:

- Custom theme integration with the application's light/dark mode via CSS variables
- Enhanced visibility for toolbar icons in dark mode
- Custom styling for dropdown menus and options

#### Dark Mode Toolbar Styling

Special care was taken to ensure toolbar icons remain visible in dark mode:

- Global style overrides are applied directly in `styles.scss` to take precedence over imported Quill styles
- Direct selectors target SVG elements to ensure proper styling regardless of nesting
- White color (#ffffff) is used for maximum visibility of icons and text
- Component-specific styles handle active states and interactions

The styling approach leverages CSS specificity rules to ensure our dark theme overrides take precedence over the default Quill styles. By placing our overrides immediately after the Quill CSS imports but before our theme variables, we ensure the styles are applied in the correct order.

### Configuration

The Quill editor is configured in both:

1. `app.config.ts` - Global configuration
2. `note-editor.component.ts` - Component-specific toolbar configuration

### Future Improvements

Potential improvements to consider:

- Add custom formats or handlers
- Implement image upload functionality
- Add additional formatting options (code blocks, tables, etc.)

## Theme System

The application uses a CSS variables-based theming system that supports both light and dark modes. This system is applied consistently across all components, including third-party components like Quill.

### Key Theme Variables

- `--text-color`: Primary text color
- `--bg-color`: Background color
- `--accent-color`: Brand/accent color for interactive elements
- `--secondary-color`: Used for secondary UI elements like toolbars

### Customizing Dark Mode

When adding new components, ensure dark mode styling is properly implemented using the `:host-context(.dark-theme)` selector for Angular components. 
