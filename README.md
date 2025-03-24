# cfNote - Secure Cloud Note Taking Application

A cloud-based note-taking application with end-to-end encryption built with Angular 19 and Cloudflare Workers.

## Features

- End-to-end encryption for notes
- Email-based authentication (no password storage)
- Modern, responsive UI with multiple themes (light, dark, sepia)
- Cloudflare Workers for backend
- Cloudflare KV for storage

## Project Structure

The project is organized as an NX monorepo:

```
cfNote/
├── nx.json
├── package.json
├── README.md
├── apps/
│   ├── web/               # Angular frontend application
│   └── api/               # Cloudflare Workers API
├── libs/                  # Shared libraries
│   ├── common/            # Shared types, constants, utilities
│   └── crypto/            # Encryption/decryption utilities
└── tools/                 # Build and development tools
```

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Start the Angular development server:

```bash
nx serve web
```

3. Start the Cloudflare Workers API:

```bash
cd api && npm run dev
```

## Architecture

### Frontend (Angular 19)

- Standalone components
- Smart/dumb component architecture
- RxJS-based state management
- Client-side encryption/decryption using Web Crypto API

### Backend (Cloudflare Workers with HonoJs)

- REST API for managing notes
- Cloudflare KV for storing encrypted notes
- No server-side decryption - all encryption/decryption happens on the client

## Security

- Notes are encrypted with AES-GCM before leaving the browser
- Email addresses and passwords are never stored in plain text
- Client-side hashing and encryption for authentication
- Each note has a unique initialization vector (IV) for additional security

## Components and Services

### Frontend Components

- **AuthFormComponent** - Form for user authentication
- **ThemeSelectorComponent** - For selecting application theme
- **NoteCardComponent** - Display of note in list
- **NoteEditorComponent** - Rich text editor for editing notes

### Frontend Containers

- **AuthContainerComponent** - Manages authentication flow
- **AppLayoutContainerComponent** - Overall application layout and theme
- **NotesListContainerComponent** - List of user's notes
- **NoteDetailContainerComponent** - Detail view and editing of a note

### Frontend Services

- **AuthService** - Handles authentication
- **CryptoService** - Handles encryption/decryption
- **NoteService** - Manages note operations
- **ThemeService** - Manages theme selection
- **StorageService** - Handles local storage

### Backend

- **Notes API** - CRUD operations for notes
- **Auth API** - Authentication handling

## Todo

1. Implement the NoteDetailContainer component with rich text editing
2. Set up proper Nx library imports between modules
3. Complete the note editing functionality
4. Enhance error handling
5. Add unit tests
6. Set up deployment workflow for Cloudflare Pages and Workers

## License

MIT
