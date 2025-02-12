import { EntryParser } from './parser';
import type { Program } from './program';
import type { ActionData, CommandArguments, CommandDefinition, CommandName, CommandOptions } from './types/command';
import type { InferCommandArguments, InferCommandOptions } from './types/utils';
import { Validator } from './validator';
import { helpOption } from './built-in';

export const createCommand = <
    const TArgs extends CommandArguments = CommandArguments,
    const TOpts extends CommandOptions = CommandOptions,
>(
    options: CommandDefinition<string, TArgs, TOpts> & { program: Program }
): Command => {
    return new Command(options as CommandDefinition<string, CommandArguments, CommandOptions> & { program: Program });
};

export type { Command };

class Command {
    program: Program;
    name: CommandName<string>;
    description?: string;
    action: (arg: ActionData<InferCommandArguments<CommandArguments>, InferCommandOptions<CommandOptions>>) => void;
    options: CommandOptions;
    args: CommandArguments;

    constructor(
        opts: CommandDefinition<string, CommandArguments, CommandOptions> & {
            program: Program;
        }
    ) {
        this.name = opts.name;
        this.action = opts.action;
        this.options = this.attachBuiltIns(opts.options ?? {});
        this.args = opts.args ?? [];
        this.program = opts.program;
        this.description = opts.description;
    }

    process(entries: string[]) {
        const parser = new EntryParser(this, this.program);
        const parsedEntries = this.program._registerError(() => parser.parse(entries), 'exit');

        const validator = new Validator(this, this.program);
        const validatedData = this.program._registerError(() => validator.validate(parsedEntries), 'exit');

        return {
            parser,
            parsedEntries,
            validator,
            validatedData,
        };
    }

    private attachBuiltIns(opts: CommandOptions): CommandOptions {
        return Object.assign(
            {
                help: helpOption,
            },
            opts
        );
    }
}
