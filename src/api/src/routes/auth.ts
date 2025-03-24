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

// Validate user
authRoutes.post('/', zValidator('json', authSchema), async (c) => {
  const { emailHash, authHash } = await c.req.json();

  try {
    // Check if user exists in KV store
    const userExists = await c.env.NOTES.get(`user:${emailHash}`);

    if (!userExists) {
      // First time user - create an entry
      await c.env.NOTES.put(`user:${emailHash}`, JSON.stringify({
        created: new Date().toISOString(),
      }));
    }

    return c.json({
      status: 'success',
      authenticated: true,
      isNewUser: !userExists
    });
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

export default authRoutes;
