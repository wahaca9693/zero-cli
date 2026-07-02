# ZERO CLI cheatsheet

This page provides a reference for commonly used ZERO CLI commands, options,
and parameters.

## CLI commands

| Command                            | Description                        | Example                                                      |
| ---------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| `zero`                           | Start interactive REPL             | `zero`                                                     |
| `zero -p "query"`                | Query non-interactively            | `zero -p "summarize README.md"`                            |
| zero "query"                     | Query and continue interactively   | zero "explain this project"                                |
| `cat file \| zero`               | Process piped content              | `cat logs.txt \| zero`<br>`Get-Content logs.txt \| zero` |
| `zero -i "query"`                | Execute and continue interactively | `zero -i "What is the purpose of this project?"`           |
| `zero -r "latest"`               | Continue most recent session       | `zero -r "latest"`                                         |
| `zero -r "latest" "query"`       | Continue session with a new prompt | `zero -r "latest" "Check for type errors"`                 |
| `zero -r "<session-id>" "query"` | Resume session by ID               | `zero -r "abc123" "Finish this PR"`                        |
| `zero update`                    | Update to latest version           | `zero update`                                              |
| `zero extensions`                | Manage extensions                  | See [Extensions Management](#extensions-management)          |
| `zero mcp`                       | Configure MCP servers              | See [MCP Server Management](#mcp-server-management)          |

### Positional arguments

| Argument | Type              | Description                                                                                                |
| -------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `query`  | string (variadic) | Positional prompt. Defaults to interactive mode in a TTY. Use `-p/--prompt` for non-interactive execution. |

## Interactive commands

These commands are available within the interactive REPL.

| Command              | Description                                     |
| -------------------- | ----------------------------------------------- |
| `/skills reload`     | Reload discovered skills from disk              |
| `/agents reload`     | Reload the agent registry                       |
| `/commands list`     | List available custom slash commands            |
| `/commands reload`   | Reload custom slash commands                    |
| `/memory reload`     | Reload context files (for example, `ZERO.md`) |
| `/mcp reload`        | Restart and reload MCP servers                  |
| `/extensions reload` | Reload all active extensions                    |
| `/help`              | Show help for all commands                      |
| `/quit`              | Exit the interactive session                    |

## CLI Options

| Option                           | Alias | Type    | Default   | Description                                                                                                                                                            |
| -------------------------------- | ----- | ------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--debug`                        | `-d`  | boolean | `false`   | Run in debug mode with verbose logging                                                                                                                                 |
| `--version`                      | `-v`  | -       | -         | Show CLI version number and exit                                                                                                                                       |
| `--help`                         | `-h`  | -       | -         | Show help information                                                                                                                                                  |
| `--model`                        | `-m`  | string  | `auto`    | Model to use. See [Model Selection](#model-selection) for available values.                                                                                            |
| `--prompt`                       | `-p`  | string  | -         | Prompt text. Appended to stdin input if provided. Forces non-interactive mode.                                                                                         |
| `--prompt-interactive`           | `-i`  | string  | -         | Execute prompt and continue in interactive mode                                                                                                                        |
| `--worktree`                     | `-w`  | string  | -         | Start ZERO in a new git worktree. If no name is provided, one is generated automatically. Requires `experimental.worktrees: true` in settings.                       |
| `--sandbox`                      | `-s`  | boolean | `false`   | Run in a sandboxed environment for safer execution                                                                                                                     |
| `--skip-trust`                   | -     | boolean | `false`   | Trust the current workspace for this session, skipping the folder trust check.                                                                                         |
| `--approval-mode`                | -     | string  | `default` | Approval mode for tool execution. Choices: `default`, `auto_edit`, `yolo`, `plan`                                                                                      |
| `--yolo`                         | `-y`  | boolean | `false`   | **Deprecated.** Auto-approve all actions. Use `--approval-mode=yolo` instead.                                                                                          |
| `--experimental-acp`             | -     | boolean | -         | Start in ACP (Agent Code Pilot) mode. **Experimental feature.**                                                                                                        |
| `--experimental-zed-integration` | -     | boolean | -         | Run in Zed editor integration mode. **Experimental feature.**                                                                                                          |
| `--allowed-mcp-server-names`     | -     | array   | -         | Allowed MCP server names (comma-separated or multiple flags)                                                                                                           |
| `--allowed-tools`                | -     | array   | -         | **Deprecated.** Use the [Policy Engine](../reference/policy-engine.md) instead. Tools that are allowed to run without confirmation (comma-separated or multiple flags) |
| `--extensions`                   | `-e`  | array   | -         | List of extensions to use. If not provided, all extensions are enabled (comma-separated or multiple flags)                                                             |
| `--list-extensions`              | `-l`  | boolean | -         | List all available extensions and exit                                                                                                                                 |
| `--resume`                       | `-r`  | string  | -         | Resume a previous session. Use `"latest"` for most recent or index number (for example `--resume 5`)                                                                   |
| `--list-sessions`                | -     | boolean | -         | List available sessions for the current project and exit                                                                                                               |
| `--delete-session`               | -     | string  | -         | Delete a session by index number (use `--list-sessions` to see available sessions)                                                                                     |
| `--include-directories`          | -     | array   | -         | Additional directories to include in the workspace (comma-separated or multiple flags)                                                                                 |
| `--screen-reader`                | -     | boolean | -         | Enable screen reader mode for accessibility                                                                                                                            |
| `--output-format`                | `-o`  | string  | `text`    | The format of the CLI output. Choices: `text`, `json`, `stream-json`                                                                                                   |

## Model selection

The `--model` (or `-m`) flag lets you specify which ZERO model to use. You can
use either model aliases (user-friendly names) or concrete model names.

### Model aliases

These are convenient shortcuts that map to specific models:

| Alias        | Resolves To                                | Description                                                                                                               |
| ------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `auto`       | `zero-2.5-pro` or `zero-3-pro-preview` | **Default.** Resolves to the preview model if preview features are enabled, otherwise resolves to the standard pro model. |
| `pro`        | `zero-2.5-pro` or `zero-3-pro-preview` | For complex reasoning tasks. Uses preview model if enabled.                                                               |
| `flash`      | `zero-2.5-flash`                         | Fast, balanced model for most tasks.                                                                                      |
| `flash-lite` | `zero-2.5-flash-lite`                    | Fastest model for simple tasks.                                                                                           |

## Extensions management

| Command                                            | Description                                  | Example                                                                        |
| -------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| `zero extensions install <source>`               | Install extension from Git URL or local path | `zero extensions install https://github.com/user/my-extension`               |
| `zero extensions install <source> --ref <ref>`   | Install from specific branch/tag/commit      | `zero extensions install https://github.com/user/my-extension --ref develop` |
| `zero extensions install <source> --auto-update` | Install with auto-update enabled             | `zero extensions install https://github.com/user/my-extension --auto-update` |
| `zero extensions uninstall <name>`               | Uninstall one or more extensions             | `zero extensions uninstall my-extension`                                     |
| `zero extensions list`                           | List all installed extensions                | `zero extensions list`                                                       |
| `zero extensions update <name>`                  | Update a specific extension                  | `zero extensions update my-extension`                                        |
| `zero extensions update --all`                   | Update all extensions                        | `zero extensions update --all`                                               |
| `zero extensions enable <name>`                  | Enable an extension                          | `zero extensions enable my-extension`                                        |
| `zero extensions disable <name>`                 | Disable an extension                         | `zero extensions disable my-extension`                                       |
| `zero extensions link <path>`                    | Link local extension for development         | `zero extensions link /path/to/extension`                                    |
| `zero extensions new <path>`                     | Create new extension from template           | `zero extensions new ./my-extension`                                         |
| `zero extensions validate <path>`                | Validate extension structure                 | `zero extensions validate ./my-extension`                                    |

See [Extensions Documentation](../extensions/index.md) for more details.

## MCP server management

| Command                                                       | Description                     | Example                                                                                              |
| ------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `zero mcp add <name> <command>`                             | Add stdio-based MCP server      | `zero mcp add github npx -y @modelcontextprotocol/server-github`                                   |
| `zero mcp add <name> <url> --transport http`                | Add HTTP-based MCP server       | `zero mcp add api-server http://localhost:3000 --transport http`                                   |
| `zero mcp add <name> <command> --env KEY=value`             | Add with environment variables  | `zero mcp add slack node server.js --env SLACK_TOKEN=xoxb-xxx`                                     |
| `zero mcp add <name> <command> --scope user`                | Add with user scope             | `zero mcp add db node db-server.js --scope user`                                                   |
| `zero mcp add <name> <command> --include-tools tool1,tool2` | Add with specific tools         | `zero mcp add github npx -y @modelcontextprotocol/server-github --include-tools list_repos,get_pr` |
| `zero mcp remove <name>`                                    | Remove an MCP server            | `zero mcp remove github`                                                                           |
| `zero mcp list`                                             | List all configured MCP servers | `zero mcp list`                                                                                    |

See [MCP Server Integration](../tools/mcp-server.md) for more details.

## Skills management

| Command                          | Description                           | Example                                           |
| -------------------------------- | ------------------------------------- | ------------------------------------------------- |
| `zero skills list`             | List all discovered agent skills      | `zero skills list`                              |
| `zero skills install <source>` | Install skill from Git, path, or file | `zero skills install https://github.com/u/repo` |
| `zero skills link <path>`      | Link local agent skills via symlink   | `zero skills link /path/to/my-skills`           |
| `zero skills uninstall <name>` | Uninstall an agent skill              | `zero skills uninstall my-skill`                |
| `zero skills enable <name>`    | Enable an agent skill                 | `zero skills enable my-skill`                   |
| `zero skills disable <name>`   | Disable an agent skill                | `zero skills disable my-skill`                  |
| `zero skills enable --all`     | Enable all skills                     | `zero skills enable --all`                      |
| `zero skills disable --all`    | Disable all skills                    | `zero skills disable --all`                     |

See [Agent Skills Documentation](./skills.md) for more details.
