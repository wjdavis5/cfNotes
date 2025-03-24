# cfNote - Secure Cloud Note Taking Application

## Project Overview
cfNote is a secure cloud-based note-taking application built with Angular 19 and Cloudflare Workers. It offers end-to-end encryption for notes, allowing users to securely store and access their notes from anywhere while maintaining privacy.

## Architecture

### High-Level Architecture
- **Frontend**: Angular 19 application deployed on Cloudflare Pages
- **Backend**: Cloudflare Workers with HonoJs 
- **Storage**: Cloudflare KV for storing encrypted notes
- **Authentication**: Email-based authentication with client-side encryption/decryption

### Technical Stack
- **Mono repo management**: NX
- **Frontend framework**: Angular 19
- **Backend framework**: HonoJs on Cloudflare Workers
- **Styling**: Tailwind CSS with proper Angular setup (@tailwindcss/postcss)
- **Hosting**: Cloudflare Pages (frontend) and Cloudflare Workers (backend)
- **Storage**: Cloudflare KV
- **Encryption**: AES-GCM (modern, secure encryption algorithm)

## Project Structure

```
cfNote/
├── nx.json
├── package.json
├── README.md
├── apps/
│   ├── web/               # Angular frontend application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── components/    # Dumb/presentational components
│   │   │   │   ├── containers/    # Smart components / containers
│   │   │   │   ├── services/      # Angular services
│   │   │   │   ├── models/        # TypeScript interfaces/types
│   │   │   │   └── utils/         # Utility functions
│   │   │   ├── assets/
│   │   │   ├── environments/
│   │   │   └── styles/            # Global styles and theme definitions
│   │   └── ...
│   └── api/               # Cloudflare Workers API
│       ├── src/
│       │   ├── routes/            # API route handlers
│       │   ├── middleware/        # API middleware
│       │   └── utils/             # Utility functions
│       └── ...
├── libs/                  # Shared libraries
│   ├── common/            # Shared types, constants, utilities
│   └── crypto/            # Encryption/decryption utilities
└── tools/                 # Build and development tools
```

## Component and Service Breakdown

### Frontend Components

#### Dumb/Presentational Components
1. **NoteCard** - Displays a note preview in the list
2. **NoteEditor** - Rich text editor for creating/editing notes
3. **AuthForm** - Reusable form for authentication
4. **ThemeSelector** - Component for switching between themes
5. **Button** - Reusable button component
6. **Modal** - Reusable modal component
7. **Spinner** - Loading indicator
8. **Toast** - Notification component

#### Smart Components/Containers
1. **NotesListContainer** - Manages list of notes, fetching and state
2. **NoteDetailContainer** - Manages single note view/edit, handles saving
3. **AuthContainer** - Manages authentication flow
4. **AppLayoutContainer** - Manages application layout and theme

#### Services
1. **AuthService** - Handles authentication logic and state
   - Email hashing
   - Password handling
   - Authentication state management
   
2. **CryptoService** - Handles encryption/decryption
   - Encrypts notes with user's password
   - Decrypts notes when password is provided
   - Generates secure key from email+password

3. **NoteService** - Handles note operations
   - CRUD operations for notes
   - Integration with API
   - Local state management

4. **ThemeService** - Handles theme switching
   - Stores user theme preference
   - Applies theme to application

5. **StorageService** - Handles local storage
   - Securely stores temporary data
   - Manages encryption keys in memory

### Backend (Cloudflare Workers with HonoJs)

#### Routes
1. **/api/notes**
   - GET: Fetch notes for a user
   - POST: Create a new note
   - PUT: Update a note
   - DELETE: Delete a note

2. **/api/auth**
   - POST: Validate user

#### Middleware
1. **errorHandler** - Centralized error handling
2. **authValidator** - Validates authentication tokens

#### Utilities
1. **kv-helpers** - Functions for interacting with Cloudflare KV
2. **hash-validator** - Functions for validating hashes

## Authentication Flow
1. User enters email and password
2. Frontend generates a hash from email + password (PBKDF2 or Argon2id)
3. This hash is used as the user identifier for API requests
4. A derived key from the password is used for note encryption/decryption
5. No raw email or password is ever sent to the server or stored

## Encryption Implementation
1. User's notes are encrypted client-side using AES-GCM
2. The encryption key is derived from the user's password using PBKDF2
3. Each note has a unique initialization vector (IV) to ensure security
4. Encrypted notes and IVs are stored in Cloudflare KV
5. When user enters password, notes are decrypted on-the-fly in the browser

## Theme Implementation
Three themes will be implemented:
1. Light Theme - Clean, minimalist with light background
2. Dark Theme - Dark mode with reduced eye strain
3. Sepia Theme - Warm colors for comfortable reading

Themes will be implemented using Tailwind CSS with proper configuration for Angular.

## Development Workflow
1. Set up NX monorepo with Angular and Cloudflare Workers projects
2. Configure Tailwind CSS correctly with PostCSS
3. Implement core services for authentication and encryption
4. Build UI components following the smart/dumb component pattern
5. Implement the Cloudflare Workers API endpoints
6. Connect frontend and backend
7. Implement theming
8. Test and refine the application

## Deployment Strategy
1. Frontend: Deploy to Cloudflare Pages
2. Backend: Deploy to Cloudflare Workers
3. Set up CI/CD pipeline for automated deployments

## Security Considerations
1. All encryption/decryption happens client-side
2. No plaintext data stored on the server
3. Use of modern, secure encryption algorithms
4. Proper key derivation using PBKDF2 with sufficient iterations
5. Protection against XSS and CSRF attacks
