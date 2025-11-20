# dt-grpc-ts

A TypeScript/Node.js client library for the [Draw Things](https://drawthings.ai/) gRPC API.

This library wraps the generated gRPC and FlatBuffers code into a user-friendly interface, making it easy to generate images, manage models, and interact with Draw Things programmatically.

## Installation

```bash
npm install dt-grpc-ts
# or
yarn add dt-grpc-ts
```

## Quick Start

Ensure your Draw Things app is running and the HTTP/gRPC server is enabled (usually on port 7859).

```typescript
import { DTService, buildRequest } from 'dt-grpc-ts'

async function main() {
  // Connect to the Draw Things service
  const service = new DTService('localhost:7859')

  // Build a request
  const request = buildRequest({
    width: 512,
    height: 512,
    steps: 20,
    model: 'Generic (SD 1.5).ckpt' // Use exact model filename or name
  }, "a cute cat sitting on a park bench")

  // Generate the image
  console.log("Generating image...")
  const images = await service.generateImage(request)

  // Save the result
  await images[0].toFile('cat.png')
  console.log("Saved to cat.png")
}

main().catch(console.error)
```

## Key Concepts

### DTService

The main entry point. It handles the connection to the Draw Things gRPC server.

```typescript
const service = new DTService('localhost:7859')
```

### buildRequest

A helper to construct image generation requests. It supports method chaining for adding images, masks, hints (ControlNet), and overrides.

```typescript
const req = buildRequest(config, prompt, negativePrompt)
  .addImage(await ImageBuffer.fromFile('input.png')) // For img2img
  .addHint('depth', await ImageBuffer.fromFile('depth_map.png'), 1.0) // ControlNet
```

### ImageBuffer

A wrapper around image data, powered by `sharp`. It handles format conversions (Tensor <-> Buffer) and resizing automatically.

```typescript
const img = await ImageBuffer.fromFile('image.png')
const resized = await resize(img, 512, 512)
```

## Development

1. Clone the repository.
2. Install dependencies: `yarn install`
3. Build the project: `yarn build`
4. Run tests: `yarn test`

## License

MIT
