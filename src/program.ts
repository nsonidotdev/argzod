import type {
    Command,
    CommandArguments,
    CommandOptions,
    CommandDefinition,
} from './types/command';
import { trySync } from './utils/try';
import { ArgzodError, ErrorCode } from './errors';
import type { ProgramConfig } from './types/program';
import { EntryParser } from './parser';

import { EntryType } from './enums';
import { Validator } from './validator';
import { createCommand } from './command';

const DEFAULT_CONFIG: ProgramConfig = {};

export const createProgram = (config?: ProgramConfig) => new Program(config);

class Program<T extends string> {
    private _commands: Command[];
    private _config: ProgramConfig;

    constructor(config?: ProgramConfig) {
        this._commands = [];
        this._config = {
            ...DEFAULT_CONFIG,
            ...config,
        };
    }

    run(args: string[] = process.argv.slice(2)) {
        const commandResult = trySync(() => this._processCommand(args));

        if (!commandResult.success) {
            if (commandResult.error instanceof ArgzodError) {
                // Set custom messages for given error
                commandResult.error.__applyMessageMap(this._config.messages)

                if (this._config.onError) {
                    this._config.onError(commandResult.error);
                } else {
                    console.error(commandResult.error.message);
                }
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
        if (this._commands.find((c) => c.name === options.name)) {
            throw new ArgzodError({
                code: ErrorCode.InvalidDefinitions,
            });
        }

        const command = createCommand<TArgs, TOpts>(options);
        this._commands.push(command);

        return command;
    }

    attachCommand(command: Command) {
        if (this._commands.find((c) => c.name === command.name)) {
            throw new ArgzodError({
                code: ErrorCode.InvalidDefinitions,
            });
        }

        this._commands.push(command as Command);

        return this;
    }

    private _wes() {}

    private _processCommand(commandLine: string[]) {
        const namedCommand = this._commands.find(
            (c) => c.name === commandLine[0]
        );
        const indexCommand = this._commands.find((c) => c.name === undefined);
        const targetCommand = namedCommand ?? indexCommand;

        commandLine =
            targetCommand === indexCommand ? commandLine : commandLine.slice(1);

        if (!targetCommand) {
            throw new ArgzodError({
                code: ErrorCode.CommandNotFound,
                ctx: [undefined],
            });
        }

        const parser = new EntryParser(targetCommand, this._config);
        const parsedEntries = parser.parse(commandLine);
        const parsedArgs = parsedEntries.filter(
            (arg) => arg.type === EntryType.Argument
        );

        const validator = new Validator(
            this._config,
            parsedEntries,
            targetCommand
        );
        const targetCommandResult = trySync(() => validator.validate());
        if (targetCommandResult.success) return targetCommandResult.data;

        if (
            targetCommand === namedCommand ||
            (targetCommand === indexCommand &&
                targetCommand.arguments.length === parsedArgs.length)
        ) {
            throw targetCommandResult.error;
        }

        throw new ArgzodError({
            code: ErrorCode.CommandNotFound,
            ctx: [parsedArgs[0]?.value],
        });
    }
}
