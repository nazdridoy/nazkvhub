# NazKVHub

A simple and efficient key-value URL storage service built on Cloudflare Workers KV. Store and retrieve URLs with optional immutability support.

## Features

- Store URLs with unique keys
- Optional immutability flag for stored URLs
- Simple REST API interface
- Secure API key authentication for write operations
- Built on Cloudflare Workers and KV storage

## API Endpoints

### Store URL
```http
POST /v1/save/{key}
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "url": "https://example.com",
  "immutable": true  
}
```
### Retrieve URL
```http
GET /v1/get/{key}
```
### Response Format

#### Success
```json
{
  "url": "https://example.com",
  "immutable": true
}
```

#### Error
```json
{
  "error": "Key not found"
}
```

## Setup

1. Clone the repository

```bash
git clone https://github.com/nazdridoy/nazkvhub.git
```

2. Install Wrangler CLI
```bash
npm install -g wrangler
```

3. Configure your environment variables
```bash
wrangler secret put API_KEY
```

4. Create a KV namespace
```bash
wrangler kv:namespace create "nazkvhubstore"
```

5. Deploy to Cloudflare Workers
```bash
wrangler deploy
```

## Usage Example

```javascript
// Store a URL
const response = await fetch('https://your-worker.workers.dev/v1/save/my-key', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer your-api-key',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        url: 'https://example.com',
        immutable: true
    })
});

// Retrieve a URL
const data = await fetch('https://your-worker.workers.dev/v1/query/my-key');
```

## Security

- API key authentication required for write operations
- Read operations are public
- HTTPS encryption for all requests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any problems or have suggestions, please open an issue on GitHub.

## License

[MIT](LICENSE) © 2024 [Nazdrido](https://github.com/nazdridoy)