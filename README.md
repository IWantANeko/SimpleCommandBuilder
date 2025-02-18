# Minecraft Command Manager

A simple command manager system for Minecraft Bedrock Edition in TypeScript. It allows you to register commands, manage permissions, and execute them based on player input.

## Features

- Register commands with aliases.
- Manage permissions for commands.
- Parse command messages and arguments.
- Flexible permission system (all or any permission required).

## Installation

1. Clone the repo:
```bash
git clone https://github.com/IWantANeko/SimpleCommandBuilder.git
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Example Command

Greet:
```typescript
import { commandManager, Command } from './commandManager';

// Register a command
const greetCommand = new Command(['greet'])
  .setCode((player) => player.sendMessage('Hello, ' + player.name))
  .setPermissions(['admin']);

commandManager.registerCommands(greetCommand);

// Execute command
InputHandler.onMessage(player, "!greet");
```
