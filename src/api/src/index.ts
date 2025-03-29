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

// Add middleware
app.use('*', cors({
  origin: ['http://localhost:4200', 'https://cfnote.app', 'https://cfnote.wjd.io'], // Allow local development and production domains
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',    // Add CSRF token header
    'X-Requested-With',
    'Accept'
  ],
  exposeHeaders: ['X-CSRF-Token'], // Expose CSRF token header to frontend
  credentials: true,  // Allow credentials (cookies) to be sent
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
  });
});

// Export app for Cloudflare Workers
export default app;
