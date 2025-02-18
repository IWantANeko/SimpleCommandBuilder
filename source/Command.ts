import { Player } from "@minecraft/server";

/////////////////////////////////////////////////////////////////////////////////////7
//* CONFIG

export const config = {
    commandPrefix: '!',
}

/////////////////////////////////////////////////////////////////////////////////////7
//* COMMAND MANAGER

export class CommandManager {
    private commands: Map<string, Command>;

    public constructor() {
        this.commands = new Map();
    }

    public registerCommands(...commands: Command[]): void {
        for (const command of commands) {
            for (const alias of command.aliases) {
                this.commands.set(alias, command);
            }
        }
    }

    public getCommands(): MapIterator<Command> {
        return this.commands.values();
    }

    public getCommandByAlias(alias: string): Command | undefined {
        return this.commands.get(alias);
    }

    public hasCommandByAlias(alias: string): boolean {
        return this.commands.has(alias);
    }

    public executeCommand(player: Player, args: string[], command: Command): void {
        if (command.executeCallback !== undefined) command.executeCallback(player, args);
    }

    public checkPermissions(player: Player, command: Command): boolean {
        if (command.permission === undefined) return true;

        const { permissions, every } = command.permission;
        if (permissions.length === 0) return true;
    
        return every
            ? permissions.every(permission => player.hasTag(permission))
            : permissions.some(permission => player.hasTag(permission));
    }
}

export const commandManager = new CommandManager();

/////////////////////////////////////////////////////////////////////////////////////7
//* COMMAND

export type ExecuteCallback = (player: Player, args: string[]) => void;
export type CommandPermission = { permissions: string[], every: boolean };

export class Command {
    public readonly aliases: string[];
    
    public description: string | undefined;
    public executeCallback: ExecuteCallback | undefined;
    public permission: CommandPermission | undefined;

    public constructor(aliases: string[]) {
        this.aliases = aliases;
    }

    public setCode(callback: ExecuteCallback): this {
        this.executeCallback = callback;
        return this;
    }

    public setDescription(description: string): this {
        this.description = description
        return this;
    }

    public setPermissions(permissions: string[], every: boolean = false): this {
        this.permission = { permissions, every };
        return this;
    }
}

/////////////////////////////////////////////////////////////////////////////////////7
//* MESSAGE HANDLER

export type CommandMessage = [string, string[]];

export class MessageHandler {
    private static readonly commandParseRegExp = /("(?:[^"\\]*(?:\\.)?[^"\\]*)+"|\S+)/gi;

    public static parseRawCommandMessage(message: string): CommandMessage {
        const [rawCommand, ...rest] = message.trim().split(/\s+/);
        const args: string[] = [];

        const command = rawCommand.startsWith(config.commandPrefix)
            ? rawCommand.replace(config.commandPrefix, "")
            : rawCommand;

        const commandBody = rest.join(" ");
        let match: RegExpExecArray | null;

        while ((match = this.commandParseRegExp.exec(commandBody)) !== null) {
            const value = (match[2] || match[1])
                .replace(/(?<!\\)"/g, "")
                .replace(/\\(.)/g, "$1");

            args.push(value);
        }

        return [command, args];
    }
}

/////////////////////////////////////////////////////////////////////////////////////7
//* INPUT HANDLER

export class InputHandler {
    public static onMessage(player: Player, message: string): Error | void {
        const [command, args] = MessageHandler.parseRawCommandMessage(message);
        const commandInstance = commandManager.getCommandByAlias(command);

        if (commandInstance === undefined) return new Error(`Command "${command}" not found.`);

        if (!commandManager.checkPermissions(player, commandInstance)) {
            return new Error(`You do not have permission to use this command.`);
        }

        commandManager.executeCommand(player, args, commandInstance);
    }
}