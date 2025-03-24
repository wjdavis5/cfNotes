# cfNote API

Backend API for the cfNote application built with HonoJs and Cloudflare Workers.

## Features

- RESTful API for note management
- End-to-end encryption (client-side)
- Cloudflare KV for storage
- No server-side decryption - all encryption/decryption happens on the client
- Email-based authentication with no password storage

## Development

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Wrangler CLI (for Cloudflare Workers)

### Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

This will start a local development server using Wrangler.

### API Endpoints

#### Auth

- `POST /api/auth` - Authenticate a user

#### Notes

- `GET /api/notes/:userHash` - Get all notes for a user
- `GET /api/notes/:userHash/:noteId` - Get a specific note
- `POST /api/notes/:userHash` - Create a new note
- `PUT /api/notes/:userHash/:noteId` - Update a note
- `DELETE /api/notes/:userHash/:noteId` - Delete a note

### Deployment

To deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Security

- No passwords or email addresses are stored in plain text
- Notes are encrypted client-side before being sent to the server
- Each note has a unique initialization vector (IV) for additional security 
