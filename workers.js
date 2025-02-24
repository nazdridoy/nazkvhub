const KV_NAMESPACE = 'nazkvhubstore';

export default {
  async fetch(request, env, ctx) {
    // Parse the URL and path
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle POST request to save URL
    if (request.method === 'POST' && path.startsWith('/v1/save/')) {
      // Validate API key for save operations only
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || `Bearer ${env.API_KEY}` !== authHeader) {
        return new Response('Unauthorized', { status: 401 });
      }

      const uniqueKey = path.split('/v1/save/')[1];
      
      if (!uniqueKey) {
        return new Response('Missing unique key', { status: 400 });
      }

      try {
        // Parse the JSON body
        const body = await request.json();
        
        if (!body.url || !body.url.startsWith('http')) {
          return new Response('Invalid URL format', { status: 400 });
        }

        // Check if key exists and is immutable
        const existingValue = await env[KV_NAMESPACE].get(uniqueKey, 'json');
        if (existingValue && existingValue.immutable !== false) {  // Only check immutable if key exists
          return new Response(JSON.stringify({
            status: 'error',
            message: 'Key exists and is immutable'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        // Store in KV as JSON
        const valueToStore = {
          url: body.url,
          immutable: body.immutable !== false  // true by default unless explicitly false
        };
        
        await env[KV_NAMESPACE].put(uniqueKey, JSON.stringify(valueToStore));
        
        return new Response(JSON.stringify({
          status: 'success',
          message: 'URL stored successfully'
        }), {
          headers: {
            'Content-Type': 'application/json'
          }
        });

      } catch (error) {
        return new Response('Invalid JSON payload', { status: 400 });
      }
    }

    // Handle GET request to query URL
    if (request.method === 'GET' && path.startsWith('/v1/query/')) {
      const uniqueKey = path.split('/v1/query/')[1];
      
      if (!uniqueKey) {
        return new Response('Missing unique key', { status: 400 });
      }

      try {
        // Get from KV
        const storedValue = await env[KV_NAMESPACE].get(uniqueKey, 'json');
        
        if (!storedValue) {
          return new Response('Key not found', { status: 404 });
        }

        return new Response(JSON.stringify({
          url: storedValue.url,
          immutable: storedValue.immutable
        }), {
          headers: {
            'Content-Type': 'application/json'
          }
        });

      } catch (error) {
        return new Response('Internal server error', { status: 500 });
      }
    }

    // Handle unknown routes
    return new Response('Not found', { status: 404 });
  },
};
