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
import { generateGuid } from './utils';

const DEFAULT_CONFIG: ProgramConfig = {};

export const createProgram = (config?: ProgramConfig) => new Program(config);
export type { Program };

class Program<T extends string = string> {
    _id: string;
    private commands: Command[];
    private config: ProgramConfig;
    private errors: ArgzodError[];

    constructor(config?: ProgramConfig) {
        this._id = generateGuid();
        this.commands = [];
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
        };
        this.errors = [];
    }

    run(args: string[] = process.argv.slice(2)) {
        // clean up previous run data
        this.cleanUp();

        const commandResult = trySync(() => this._processCommand(args));

        if (!commandResult.success || this.errors.length) {
            // Set custom messages for given error
            this.errors.forEach((e) =>
                e.__applyMessageMap(this.config.messages)
            );

            if (this.config.onError) {
                this.config.onError(this.errors);
            } else {
                console.error(this.errors.map((e) => e.message).join('\n'));
            }

            process.exit(1);
        }

        const { command, parsedCommandLine, validatedArgs, validatedOptions } =
            commandResult.data;

        command.action({
            args: validatedArgs,
            options: validatedOptions,
            parsedCommandLine: parsedCommandLine,
        });
    }

    command<
        const TArgs extends CommandArguments,
        const TOpts extends CommandOptions,
    >(options: CommandDefinition<T, TArgs, TOpts>): Command {
        if (this.commands.find((c) => c.name === options.name)) {
            throw new ArgzodError({
                code: ErrorCode.InvalidDefinitions,
            });
        }

        const command = createCommand<TArgs, TOpts>(options);
        this.commands.push(command);

        return command;
    }

    attachCommand(command: Command) {
        if (this.commands.find((c) => c.name === command.name)) {
            throw new ArgzodError({
                code: ErrorCode.InvalidDefinitions,
            });
        }

        this.commands.push(command as Command);

        return this;
    }

    private _processCommand(commandLine: string[]) {
        const namedCommand = this.commands.find(
            (c) => c.name === commandLine[0]
        );
        const indexCommand = this.commands.find((c) => c.name === undefined);
        const targetCommand = namedCommand ?? indexCommand;

        commandLine =
            targetCommand === indexCommand ? commandLine : commandLine.slice(1);

        if (!targetCommand) {
            this._registerError(
                new ArgzodError({
                    code: ErrorCode.CommandNotFound,
                    ctx: [undefined],
                }),
                'critical'
            );
        }

        const parser = new EntryParser(targetCommand, this);
        const parsedEntries = parser.parse(commandLine);
        const parsedArgs = parsedEntries.filter(
            (arg) => arg.type === EntryType.Argument
        );

        const validator = new Validator(this, parsedEntries, targetCommand);
        const targetCommandResult = trySync(() => validator.validate());
        if (targetCommandResult.success) return targetCommandResult.data;

        if (
            targetCommand === namedCommand ||
            (targetCommand === indexCommand &&
                targetCommand.arguments.length === parsedArgs.length)
        ) {
            this._registerError(targetCommandResult.error, 'critical');
        }

        this._registerError(new ArgzodError({
            code: ErrorCode.CommandNotFound,
            ctx: [parsedArgs[0]?.value],
        }), 'critical');
    }

    _registerError(error: ArgzodError, critical: 'critical'): never;
    _registerError(error: ArgzodError): void;
    _registerError(error: ArgzodError, critical?: 'critical'): void | never {
        this.errors.push(error);

        if (critical) {
            throw error;
        }
    }

    private cleanUp() {
        this.errors = [];
    }
}
