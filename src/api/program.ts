import type { CommandArguments, CommandOptions, CommandDefinition } from '../types/command';
import { ArgzodError, ErrorCode } from '../errors';
import type { ProgramConfig } from '../types/program';
import type { Command } from './command';
import { createCommand } from './command';
import { generateGuid, groupErrors } from '../utils';
import { ErrorLevel } from '../enums';
import { WARN_CHAR } from '../constants';
import chalk from 'chalk';
import type { GroupedErrors } from '../types';
import { HelpLogger } from '../utils/help-logger';

const DEFAULT_CONFIG: ProgramConfig = {
    name: '',
    undefinedOptionsBehavior: ErrorLevel.Error,
};

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
        this.cleanUp();
        const { process: processCommand, targetCommand, indexCommand } = this.matchCommand(args);
        const { validatedArgs, validatedOptions, parsedEntries } = processCommand();
        const validatedMap = Object.fromEntries(Object.entries(validatedOptions.validated).map(([key, opt]) => [key, opt.value]))
        
        const isHelp = validatedMap.help;
        
        if (isHelp) {
            this.logHelp({ targetCommand, indexCommand });
            process.exit(0);
        }
        
        if (this.errors.size) {
            const { error } = this.logErrors();
            
            if (error.length) process.exit(1);
        }
        
        
        targetCommand.action({
            args: validatedArgs,
            options: validatedMap,
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

    private matchCommand(commandLine: string[]) {
        const namedCommand = this.commands.find((c) => c.name === commandLine[0]);
        const indexCommand = this.commands.find((c) => c.name === undefined);
        const targetCommand = namedCommand ?? indexCommand;

        commandLine = targetCommand === indexCommand ? commandLine : commandLine.slice(1);

        if (!targetCommand) {
            this._registerError(
                new ArgzodError({
                    code: ErrorCode.CommandNotFound,
                    ctx: [commandLine[0]],
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

    private logHelp({ indexCommand, targetCommand }: { targetCommand: Command; indexCommand?: Command }) {
        const helpLogger = new HelpLogger({
            commands: this.commands,
            targetCommand,
            isIndexCommand: targetCommand === indexCommand,
            programName: this.config.name,
            programDescription: this.config.description,
        });

        helpLogger.log();
    }

    private logErrors(): GroupedErrors {
        // Set custom messages for given error
        this.errors.forEach((e) => e.__applyMessageMap(this.config.messages));

        const errorsArray = Array.from(this.errors);

        const groupedErrors = groupErrors(errorsArray, (error) => {
            if (this.config.undefinedOptionsBehavior === ErrorLevel.Warn && error.code === ErrorCode.OptionNotDefined) {
                return ErrorLevel.Warn;
            }
        });

        this.config.onError?.(groupedErrors);

        groupedErrors.warn.forEach((e) => {
            console.log(
                `${chalk.yellow(`[${WARN_CHAR} ${chalk.bold('Warning')}]`)}${e.path ? ` | ${chalk.bold(e.path)}` : ''} | ${e.message}`
            );
        });

        groupedErrors.error.forEach((e) => {
            console.log(
                `${chalk.red(`[${WARN_CHAR} ${chalk.bold('Error')}]`)}${e.path ? ` | ${chalk.bold(e.path)}` : ''} | ${e.message}`
            );
        });

        return groupedErrors;
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
            this.logErrors();

            process.exit(1);
        }
    }

    _errorExit() {
        this.logErrors();
        process.exit(1)
    }

    private cleanUp() {
        this.errors = new Set();
    }
}
