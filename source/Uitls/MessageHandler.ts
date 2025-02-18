import config from "./Config";

const commandPrefix = config.commandPrefix;

export type CommandMessage = [string, string[]];

export class MessageHandler {
    private static readonly commandParseRegExp = /("(?:[^"\\]*(?:\\.)?[^"\\]*)+"|\S+)/gi;

    public static parseRawCommandMessage(message: string): CommandMessage {
        const [rawCommand, ...rest] = message.trim().split(/\s+/);
        const args: string[] = [];

        const command = rawCommand.startsWith(commandPrefix)
            ? rawCommand.replace(commandPrefix, "")
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