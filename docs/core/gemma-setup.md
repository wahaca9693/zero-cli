# `zero gemma` — Automated Local Model Routing Setup

Local model routing uses a local Gemma 3 1B model running on your machine to
classify and route user requests. It routes simple requests (like file reads) to
ZERO Flash and complex requests (like architecture discussions) to ZERO Pro.

<!-- prettier-ignore -->
> [!NOTE]
> This is an experimental feature currently under active development.

## What is this?

This feature saves cloud API costs by using local inference for task
classification instead of a cloud-based classifier. It adds a few milliseconds
of local latency but can significantly reduce the overall token usage for hosted
models.

## Quick start

```bash
# One command does everything: downloads runtime, pulls model, configures settings, starts server
zero gemma setup
```

You'll be prompted to accept the Gemma Terms of Use. The model is ~1 GB.

After setup, **just use the CLI normally** — routing happens automatically on
every request.

## Commands

| Command               | What it does                                                   |
| --------------------- | -------------------------------------------------------------- |
| `zero gemma setup`  | Full install (binary + model + settings + server start)        |
| `zero gemma status` | Health check — shows what's installed and running              |
| `zero gemma start`  | Start the LiteRT server (auto-starts on CLI launch by default) |
| `zero gemma stop`   | Stop the LiteRT server                                         |
| `zero gemma logs`   | Tail the server logs to see routing requests live              |
| `/gemma`              | In-session status check (type it inside the CLI)               |

## Verifying it works

1. Run `zero gemma status` — all checks should show green
2. Open two terminals:
   - Terminal 1: `zero gemma logs` (watch for incoming requests)
   - Terminal 2: use the CLI normally
3. You should see classification requests appear in the logs as you interact
   with the CLI
4. The `/gemma` slash command inside a session shows a quick status panel

## Setup flags

```bash
zero gemma setup --port 8080      # custom port
zero gemma setup --no-start       # don't start server after install
zero gemma setup --force           # re-download everything
zero gemma setup --skip-model     # binary only, skip the 1GB model download
```

## How it works under the hood

- Local Gemma classifies each request as "simple" or "complex" (~100ms)
- Simple → Flash, Complex → Pro
- If the local server is down, the CLI silently falls back to the cloud
  classifier — no errors, no disruption

## Disabling

Set `enabled: false` in settings or just run `zero gemma stop` to turn off the
server:

```json
{ "experimental": { "gemmaModelRouter": { "enabled": false } } }
```

## Advanced setup

If you are in an environment where the `zero gemma setup` command cannot
automatically download binaries (for example, behind a strict corporate
firewall), you can perform the setup manually.

For more information, see the
[Manual Local Model Routing Setup guide](./local-model-routing.md).
