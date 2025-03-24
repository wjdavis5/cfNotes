import { Context, MiddlewareHandler } from 'hono';

export const errorHandler = (): MiddlewareHandler => {
  return async (c, next) => {
    try {
      await next();
    } catch (error) {
      console.error('Error in request:', error);

      let status = 500;
      let message = 'Internal Server Error';

      if (error instanceof Error) {
        message = error.message;
      }

      // Handle specific error types
      if (error && typeof error === 'object' && 'status' in error) {
        status = Number(error.status) || 500;
      }

      return c.json({ error: message }, status as 500);
    }
  };
};
