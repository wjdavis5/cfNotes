import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// Environment interface
interface Env {
  NOTES: KVNamespace;
}

const notesRoutes = new Hono<{ Bindings: Env }>();

// Schema for note creation/update
const noteSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  content: z.string(),
  encryptedContent: z.string(),
  iv: z.string(),
  salt: z.string(),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

// Get all notes for a user
notesRoutes.get('/:userHash', async (c) => {
  const userHash = c.req.param('userHash');
  console.debug(`[GET] Fetching all notes for user: ${userHash}`);

  if (!userHash) {
    console.debug(`[GET] Missing userHash parameter`);
    return c.json({ error: 'User hash is required' }, 400);
  }

  try {
    // List all notes for this user (get keys with a specific prefix)
    console.debug(`[GET] Listing keys with prefix: note:${userHash}:`);
    const listResult = await c.env.NOTES.list({ prefix: `note:${userHash}:` });
    console.debug(`[GET] Found ${listResult.keys.length} notes for user: ${userHash}`);

    // If no notes found, return empty array
    if (!listResult.keys.length) {
      console.debug(`[GET] No notes found for user: ${userHash}`);
      return c.json({ notes: [] });
    }

    // Fetch all notes in parallel
    console.debug(`[GET] Fetching ${listResult.keys.length} notes in parallel`);
    const notesPromises = listResult.keys.map(async (key) => {
      console.debug(`[GET] Fetching note with key: ${key.name}`);
      const noteData = await c.env.NOTES.get(key.name);
      if (!noteData) {
        console.debug(`[GET] Note not found for key: ${key.name}`);
        return null;
      }

      const parsedNote = JSON.parse(noteData);
      console.debug(`[GET] Successfully fetched note: ${parsedNote.id}\r\n${noteData}`);
      return parsedNote;
    });

    const notes = (await Promise.all(notesPromises)).filter(Boolean);
    console.debug(`[GET] Successfully fetched ${notes.length} notes for user: ${userHash}`);

    return c.json({ notes });
  } catch (error) {
    console.error(`[GET] Error fetching notes for user ${userHash}:`, error);
    return c.json({ error: 'Failed to fetch notes' }, 500);
  }
});

// Get a specific note
notesRoutes.get('/:userHash/:noteId', async (c) => {
  const userHash = c.req.param('userHash');
  const noteId = c.req.param('noteId');
  console.debug(`[GET] Fetching note ${noteId} for user: ${userHash}`);

  if (!userHash || !noteId) {
    console.debug(`[GET] Missing required parameters. userHash: ${!!userHash}, noteId: ${!!noteId}`);
    return c.json({ error: 'User hash and note ID are required' }, 400);
  }

  try {
    const noteKey = `note:${userHash}:${noteId}`;
    console.debug(`[GET] Fetching note with key: ${noteKey}`);
    const noteData = await c.env.NOTES.get(noteKey);

    if (!noteData) {
      console.debug(`[GET] Note not found for key: ${noteKey}`);
      return c.json({ error: 'Note not found' }, 404);
    }

    const parsedNote = JSON.parse(noteData);
    console.debug(`[GET] Successfully fetched note: ${parsedNote.id}`);
    return c.json(parsedNote);
  } catch (error) {
    console.error(`[GET] Error fetching note ${noteId} for user ${userHash}:`, error);
    return c.json({ error: 'Failed to fetch note' }, 500);
  }
});

// Create a new note
notesRoutes.post('/:userHash', zValidator('json', noteSchema), async (c) => {
  const userHash = c.req.param('userHash');
  console.debug(`[POST] Creating new note for user: ${userHash}`);
  
  try {
    const noteData = await c.req.json();
    console.debug(`[POST] Received note data:`, JSON.stringify({
      id: noteData.id,
      title: noteData.title,
      contentLength: noteData.content?.length || 0,
      encryptedContentLength: noteData.encryptedContent?.length || 0
    }));

    if (!userHash) {
      console.debug(`[POST] Missing userHash parameter`);
      return c.json({ error: 'User hash is required' }, 400);
    }

    // Generate a unique ID if not provided
    const noteId = noteData.id || crypto.randomUUID();
    const timestamp = new Date().toISOString();
    console.debug(`[POST] Generated noteId: ${noteId}, timestamp: ${timestamp}`);

    // Prepare the note object
    const note = {
      id: noteId,
      title: noteData.title,
      encryptedContent: noteData.encryptedContent,
      iv: noteData.iv, // Initialization vector for decryption
      salt: noteData.salt, // Include salt for decryption
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    console.debug(`[POST] Prepared note object for storage`);

    // Store the note in KV
    const noteKey = `note:${userHash}:${noteId}`;
    console.debug(`[POST] Storing note with key: ${noteKey}`);
    await c.env.NOTES.put(noteKey, JSON.stringify(note));
    console.debug(`[POST] Successfully stored note with key: ${noteKey}\r\n${JSON.stringify(note)}`);

    return c.json({ success: true, note });
  } catch (error) {
    console.error(`[POST] Error creating note for user ${userHash}:`, error);
    return c.json({ error: 'Failed to create note' }, 500);
  }
});

// Update an existing note
notesRoutes.put('/:userHash/:noteId', zValidator('json', noteSchema), async (c) => {
  const userHash = c.req.param('userHash');
  const noteId = c.req.param('noteId');
  console.debug(`[PUT] Updating note ${noteId} for user: ${userHash}`);

  try {
    const noteData = await c.req.json();
    console.debug(`[PUT] Received note data:`, JSON.stringify({
      title: noteData.title,
      contentLength: noteData.content?.length || 0,
      encryptedContentLength: noteData.encryptedContent?.length || 0,
      saltExists: !!noteData.salt,
      ivExists: !!noteData.iv
    }));

    if (!userHash || !noteId) {
      console.debug(`[PUT] Missing required parameters. userHash: ${!!userHash}, noteId: ${!!noteId}`);
      return c.json({ error: 'User hash and note ID are required' }, 400);
    }

    const noteKey = `note:${userHash}:${noteId}`;
    console.debug(`[PUT] Fetching existing note with key: ${noteKey}`);
    const existingNote = await c.env.NOTES.get(noteKey);

    if (!existingNote) {
      console.debug(`[PUT] Note not found for key: ${noteKey}`);
      return c.json({ error: 'Note not found' }, 404);
    }

    // Update the note
    const currentNote = JSON.parse(existingNote);
    console.debug(`[PUT] Found existing note:`, JSON.stringify({
      id: currentNote.id,
      title: currentNote.title,
      encryptedContentLength: currentNote.encryptedContent?.length || 0,
      updatedAt: currentNote.updatedAt,
      hasSalt: !!currentNote.salt
    }));
    
    const updatedNote = {
      ...currentNote,
      title: noteData.title,
      encryptedContent: noteData.encryptedContent,
      iv: noteData.iv,
      salt: noteData.salt, // Include salt for later decryption
      updatedAt: new Date().toISOString(),
    };
    console.debug(`[PUT] Prepared updated note object`);

    // Store the updated note
    console.debug(`[PUT] Storing updated note with key: ${noteKey}`);
    await c.env.NOTES.put(noteKey, JSON.stringify(updatedNote));
    console.debug(`[PUT] Successfully updated note with key: ${noteKey}`);

    return c.json({ success: true, note: updatedNote });
  } catch (error) {
    console.error(`[PUT] Error updating note ${noteId} for user ${userHash}:`, error);
    return c.json({ error: 'Failed to update note' }, 500);
  }
});

// Delete a note
notesRoutes.delete('/:userHash/:noteId', async (c) => {
  const userHash = c.req.param('userHash');
  const noteId = c.req.param('noteId');
  console.debug(`[DELETE] Deleting note ${noteId} for user: ${userHash}`);

  if (!userHash || !noteId) {
    console.debug(`[DELETE] Missing required parameters. userHash: ${!!userHash}, noteId: ${!!noteId}`);
    return c.json({ error: 'User hash and note ID are required' }, 400);
  }

  try {
    const noteKey = `note:${userHash}:${noteId}`;
    console.debug(`[DELETE] Deleting note with key: ${noteKey}`);

    // Delete the note
    await c.env.NOTES.delete(noteKey);
    console.debug(`[DELETE] Successfully deleted note with key: ${noteKey}`);

    return c.json({ success: true });
  } catch (error) {
    console.error(`[DELETE] Error deleting note ${noteId} for user ${userHash}:`, error);
    return c.json({ error: 'Failed to delete note' }, 500);
  }
});

// Migration endpoint to fix notes missing the salt field
notesRoutes.post('/:userHash/fix-notes', async (c) => {
  const userHash = c.req.param('userHash');
  console.debug(`[MIGRATION] Fixing notes for user: ${userHash}`);
  
  try {
    if (!userHash) {
      return c.json({ error: 'User hash is required' }, 400);
    }
    
    // List all notes for this user
    const prefix = `note:${userHash}:`;
    console.debug(`[MIGRATION] Listing notes with prefix: ${prefix}`);
    const keys = await c.env.NOTES.list({ prefix });
    console.debug(`[MIGRATION] Found ${keys.keys.length} notes`);
    
    // Track fixed notes
    const fixedNotes = [];
    const alreadyValid = [];
    const failedFixes = [];
    
    // Process each note
    for (const key of keys.keys) {
      console.debug(`[MIGRATION] Processing note with key: ${key.name}`);
      const noteJson = await c.env.NOTES.get(key.name);
      
      if (!noteJson) {
        console.debug(`[MIGRATION] Note not found for key: ${key.name}`);
        failedFixes.push({ key: key.name, reason: 'Not found' });
        continue;
      }
      
      const note = JSON.parse(noteJson);
      
      // Check if salt is missing
      if (note.salt) {
        console.debug(`[MIGRATION] Note already has salt: ${key.name}`);
        alreadyValid.push(note.id);
        continue;
      }
      
      // Add a default salt if missing
      console.debug(`[MIGRATION] Adding salt to note: ${key.name}`);
      note.salt = 'migrated-salt-' + crypto.randomUUID().slice(0, 8);
      
      // Save the updated note
      await c.env.NOTES.put(key.name, JSON.stringify(note));
      console.debug(`[MIGRATION] Fixed note: ${key.name}`);
      fixedNotes.push(note.id);
    }
    
    return c.json({ 
      success: true, 
      stats: {
        total: keys.keys.length,
        fixed: fixedNotes.length,
        alreadyValid: alreadyValid.length,
        failed: failedFixes.length
      },
      fixedNotes,
      alreadyValid,
      failedFixes
    });
  } catch (error) {
    console.error(`[MIGRATION] Error fixing notes for user ${userHash}:`, error);
    return c.json({ error: 'Failed to fix notes' }, 500);
  }
});

export default notesRoutes;
