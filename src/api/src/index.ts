import { Hono } from 'hono';
import { cors } from 'hono/cors';
import notesRoutes from './routes/notes';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/error-handler';

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

app.use('*', errorHandler());

// Mount routes
app.route('/api/notes', notesRoutes);
app.route('/api/auth', authRoutes);

// Root endpoint for health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'cfNote API is running',
    env: isDev() ? 'development' : 'production'
  });
});

// Export app for Cloudflare Workers
export default app;
