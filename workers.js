/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


export default {
  async fetch(request, env, ctx) {
    // Parse the URL and path
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle POST request to save URL
    if (request.method === 'POST' && path.startsWith('/v1/save/')) {
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

        // Store in KV
        await env.nazkvhubstore.put(uniqueKey, body.url);
        
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
        const storedUrl = await env.nazkvhubstore.get(uniqueKey);
        
        if (!storedUrl) {
          return new Response('Key not found', { status: 404 });
        }

        return new Response(JSON.stringify({
          url: storedUrl
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
