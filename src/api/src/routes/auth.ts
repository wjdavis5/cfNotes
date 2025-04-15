import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// Environment interface
interface Env {
  NOTES: KVNamespace;
}

const authRoutes = new Hono<{ Bindings: Env }>();

// Validation schema for user authentication
const authSchema = z.object({
  emailHash: z.string().min(10),
  authHash: z.string().min(10),
});

// Validate user - add both the root and explicit routes to ensure it works in all environments
authRoutes.post('/', zValidator('json', authSchema), async (c) => {
  console.log('Auth endpoint called with POST to /')
  return handleAuth(c);
});

// Add an extra handler for the /auth path to handle potential path conflicts
authRoutes.post('/auth', zValidator('json', authSchema), async (c) => {
  console.log('Auth endpoint called with POST to /auth')
  return handleAuth(c);
});

// Shared authentication logic
async function handleAuth(c: any) {
  try {
    const { emailHash, authHash } = await c.req.json();

    // Debug log
    console.log(`Authentication attempt for hash: ${emailHash.substring(0, 10)}...`);

    // Check if user exists in KV store
    const userExists = await c.env.NOTES.get(`user:${emailHash}`);

    if (!userExists) {
      // First time user - create an entry
      console.log('New user - creating entry');
      await c.env.NOTES.put(`user:${emailHash}`, JSON.stringify({
        created: new Date().toISOString(),
      }));
    } else {
      console.log('Existing user authenticated');
    }

    return c.json({
      status: 'success',
      authenticated: true,
      isNewUser: !userExists
    });
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({
      status: 'error',
      message: 'Authentication failed',
      error: String(error)
    }, 500);
  }
}

export default authRoutes;
