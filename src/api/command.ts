import type { Program } from './program';
import type { ActionData, CommandArguments, CommandDefinition, CommandName, CommandOptions } from '../types/command';
import type { InferCommandArguments, InferCommandOptions } from '../types/utils';
import { helpOption } from '../built-in';
import { parseEntries, resolveEntries, validateArgs, validateOptions } from '../core';
import { EntryType } from '../enums';

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
        const parsedEntries = parseEntries(this, entries).unwrap(this.program);
        console.log(parsedEntries)
        const resolvedEntries = resolveEntries(this, parsedEntries).unwrap(this.program);
        console.log(resolvedEntries)

        const options = resolvedEntries.filter(e => e.type === EntryType.Option);
        const args = resolvedEntries.filter(e => e.type === EntryType.Argument);

        const validatedOptions = validateOptions(options, this.options).unwrap(this.program);
        console.log(validatedOptions)

        const validatedArgs = validateArgs(this, args).unwrap(this.program);
        console.log(validatedArgs)

        return {
            entries,
            parsedEntries,
            resolvedEntries,
            validatedOptions,
            validatedArgs
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
