import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';

/**
 * Validates Firebase Admin auth header
 * @param req - NextRequest object
 * @returns Promise<DecodedIdToken> - Decoded token if valid
 * @throws Error if authentication fails
 */
export async function validateAdmin(req: NextRequest) {
  // TODO: TEMPORARY - Skip authentication for development
  console.log('⚠️ WARNING: Admin authentication is disabled for development');
  return { uid: 'dev-user', email: 'dev@example.com', admin: true };
  
  /* TODO: Re-enable for production
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.split('Bearer ')[1];
  
  if (!token) {
    throw new Error('Missing authentication token');
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Optional: Add admin claim validation
    if (!decodedToken.admin && !decodedToken.email?.endsWith('@admin.com')) {
      throw new Error('Insufficient permissions');
    }
    
    return decodedToken;
  } catch (error) {
    throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  */
}

/**
 * Wraps route handlers in try/catch and returns JSON { error } on failure
 * @param fn - Async route handler function
 * @returns Wrapped route handler with error handling
 */
export function withErrorHandling(
  fn: (req: NextRequest, context?: any) => Promise<Response>
) {
  return async (req: NextRequest, context?: any): Promise<Response> => {
    try {
      return await fn(req, context);
    } catch (error) {
      console.error('API Route Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = errorMessage.includes('Authentication') || errorMessage.includes('Insufficient') ? 401 : 
                        errorMessage.includes('not found') ? 404 :
                        errorMessage.includes('validation') ? 400 : 500;
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          timestamp: new Date().toISOString()
        }),
        { 
          status: statusCode,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
} 