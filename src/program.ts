import type { CommandArguments, CommandOptions, CommandDefinition } from './types/command';
import { ArgzodError, ErrorCode } from './errors';
import type { ProgramConfig } from './types/program';
import type { Command } from './command';
import { createCommand } from './command';
import { generateGuid } from './utils';

const DEFAULT_CONFIG: ProgramConfig = {};

export const createProgram = (config?: ProgramConfig) => new Program(config);
export type { Program };

class Program<T extends string = string> {
    _id: string;
    private commands: Command[];
    private config: ProgramConfig;
    private errors: Set<ArgzodError>;

    constructor(config?: ProgramConfig) {
        this._id = generateGuid();
        this.commands = [];
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
        };
        this.errors = new Set();
    }

    run(args: string[] = process.argv.slice(2)) {
        // clean up previous run data
        this.cleanUp();

        const { process: processCommand, targetCommand } = this._matchCommand(args);
        const { validatedData, parsedEntries } = processCommand();

        if (this.errors.size) {
            this.exitError();
        }

        targetCommand.action({
            args: validatedData.validatedArgs,
            options: validatedData.validatedOptions,
            parsedCommandLine: parsedEntries,
        });
    }

    command<const TArgs extends CommandArguments, const TOpts extends CommandOptions>(
        options: CommandDefinition<T, TArgs, TOpts>
    ): Command {
        if (this.commands.find((c) => c.name === options.name)) {
            throw new ArgzodError({
                code: ErrorCode.InvalidDefinitions,
            });
        }

        const command = createCommand<TArgs, TOpts>({
            ...options,
            program: this,
        });
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

    private _matchCommand(commandLine: string[]) {
        const namedCommand = this.commands.find((c) => c.name === commandLine[0]);
        const indexCommand = this.commands.find((c) => c.name === undefined);
        const targetCommand = namedCommand ?? indexCommand;

        commandLine = targetCommand === indexCommand ? commandLine : commandLine.slice(1);

        if (!targetCommand) {
            this._registerError(
                new ArgzodError({
                    code: ErrorCode.CommandNotFound,
                    ctx: [undefined],
                }),
                'exit'
            );
        }

        return {
            targetCommand,
            namedCommand,
            indexCommand,
            commandEntries: commandLine,
            process: () => targetCommand.process(commandLine),
        };
    }

    private exitError(): never {
        // Set custom messages for given error
        this.errors.forEach((e) => e.__applyMessageMap(this.config.messages));

        if (this.config.onError) {
            this.config.onError(Array.from(this.errors));
        } else {
            console.error(
                Array.from(this.errors)
                    .map((e) => e.message)
                    .map((e) => `ERROR: ${e}`)
                    .join('\n')
            );
        }

        process.exit(1);
    }

    _registerError(error: ArgzodError): void;
    _registerError(error: ArgzodError, exit: 'exit'): never;

    _registerError<T>(operation: () => T): T | void;
    _registerError<T>(operation: () => T, exit: 'exit'): T;

    _registerError(error: ArgzodError | (() => any), exit?: 'exit'): void | never {
        let unwrappedError: ArgzodError;

        if (error instanceof ArgzodError) {
            unwrappedError = error;
        } else {
            try {
                return error();
            } catch (error) {
                if (!(error instanceof ArgzodError)) {
                    throw new Error('You should never see this. If you do please create a GitHub issue');
                }

                unwrappedError = error;
            }
        }

        this.errors.add(unwrappedError);

        if (exit) {
            this.exitError();
        }
    }

    private cleanUp() {
        this.errors = new Set();
    }
}
