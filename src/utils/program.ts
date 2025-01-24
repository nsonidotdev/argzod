import {
    Command,
    CommandArguments,
    CommandOptions,
    ActionFn,
    CommandDefinition,
} from '../types/command';
import { z } from 'zod';
import { trySync } from '../utils/try';
import { getCommandData } from '../utils';
import { ArgzodError, ErrorCode } from '../errors';

export const createProgram = () => new Program();

class Program<T extends string> {
    private _commands: Command[];

    constructor() {
        this._commands = [];
    }

    run(args: string[] = process.argv.slice(2)) {
        const commandResult = trySync(() =>
            getCommandData({
                commandLine: args,
                commands: this._commands,
            })
        );

        if (!commandResult.success) {
            if (commandResult.error instanceof ArgzodError) {
                console.error(commandResult.error.message);
            }

            if (commandResult.error instanceof z.ZodError) {
                console.error(
                    commandResult.error.issues
                        .map((i) => {
                            i.message;
                        })
                        .join('\n')
                );
            }

            process.exit(1);
        }

        commandResult.data.command.action({
            args: commandResult.data.validatedArgs,
            options: commandResult.data.validatedOptions,
            parsedCommandLine: commandResult.data.parsedCommandLine,
        });
    }

    command<
        const TArgs extends CommandArguments,
        const TOpts extends CommandOptions,
    >(options: CommandDefinition<T, TArgs, TOpts>): Command {
        const command: Command = {
            name: options.name,
            arguments: options.args ?? [],
            options: options.options ?? {},
            action: options.action as ActionFn,
        };

        if (this._commands.find((c) => c.name === command.name)) {
            throw new ArgzodError({
                code: ErrorCode.CommandDuplication,
            });
        }

        this._commands.push(command as Command);

        return command;
    }

    attachCommand(command: Command) {
        if (this._commands.find((c) => c.name === command.name)) {
            throw new ArgzodError({
                code: ErrorCode.CommandDuplication,
            });
        }

        this._commands.push(command as Command);

        return this;
    }
}
