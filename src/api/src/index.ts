import { Hono } from 'hono';
import { cors } from 'hono/cors';
import notesRoutes from './routes/notes';
import { errorHandler } from './middleware/error-handler';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// Define environment interface
interface Env {
  NOTES: KVNamespace;
}

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Detect if running in development mode
const isDev = (): boolean => {
  // For Cloudflare Workers, we can check for specific env vars or deploy targets
  // This is a simple check that should work for most dev environments
  return false; // Always false in workers, true when running locally with wrangler dev
};

// Add middleware with dynamic CORS config
app.use('*', cors({
  // Allow localhost and production domains
  origin: ['http://localhost:4200', 'http://localhost:3000', 'http://127.0.0.1:8787', 'http://127.0.0.1:4200', 'https://cfnote.app', 'https://cfnote.wjd.io'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With',
    'Accept'
  ],
  exposeHeaders: ['X-CSRF-Token'],
  credentials: true,
  maxAge: 86400,
}));

// Add debugging middleware to log all requests
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url} - HTTP/${c.req.raw.headers.get('host')}`);
  await next();
});

app.use('*', errorHandler());

// Mount notes routes
app.route('/api/notes', notesRoutes);
// Also mount at /notes for direct worker domain access
app.route('/notes', notesRoutes);

// Validation schema for user authentication
const authSchema = z.object({
  emailHash: z.string().min(10),
  authHash: z.string().min(10),
});

// Authentication handlers for different path patterns
// Handle requests to /api/auth (typically from frontend)
app.post('/api/auth', zValidator('json', authSchema), async (c) => {
  console.log('Auth endpoint called at /api/auth');
  return handleAuth(c);
});

// Also handle direct requests to /auth (when worker is at root path)
app.post('/auth', zValidator('json', authSchema), async (c) => {
  console.log('Auth endpoint called at /auth');
  return handleAuth(c);
});

// Shared authentication logic
async function handleAuth(c: { env: Env; req: { json: () => Promise<any> }; json: (body: any, status?: number) => any }) {
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

// Root endpoint for health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'cfNote API is running',
    env: isDev() ? 'development' : 'production',
    version: '1.1.0'
  });
});

// Export app for Cloudflare Workers
export default app;
