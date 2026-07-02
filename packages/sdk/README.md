# @google/zero-cli-sdk

The ZERO CLI SDK provides a programmatic interface to interact with ZERO
models and tools.

## Installation

```bash
npm install @google/zero-cli-sdk
```

## Usage

```typescript
import { ZEROCliAgent } from '@google/zero-cli-sdk';

async function main() {
  const agent = new ZEROCliAgent({
    instructions: 'You are a helpful assistant.',
  });

  const controller = new AbortController();
  const signal = controller.signal;

  // Stream responses from the agent
  const stream = agent.sendStream('Why is the sky blue?', signal);

  for await (const chunk of stream) {
    if (chunk.type === 'content') {
      process.stdout.write(chunk.value.text || '');
    }
  }
}

main().catch(console.error);
```
