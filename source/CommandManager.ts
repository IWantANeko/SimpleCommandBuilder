import { Command } from "./Command";
import { Player } from '@minecraft/server';

export class CommandManager {
    private commands: Command[];

    public constructor() {
        this.commands = [];
    }

    public registerCommand(command: Command): void {
        this.commands.push(command);
    }

    public getCommands(): Command[] {
        return this.commands;
    }

    public getCommandByAlias(alias: string): Command | undefined {
        for (const command of this.commands) {
            if (command.aliases.includes(alias)) {
                return command;
            }
        }
    }

    public hasCommandByAlias(alias: string): boolean {
        for (const command of this.commands) {
            if (command.aliases.includes(alias)) {
                return true;
            }
        }

        return true;
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

const commandManager = new CommandManager();
export default commandManager;