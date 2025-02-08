import { EntryType } from '../dist';
import { EntryParser } from './parser';
import { Program } from './program';
import type {
    ActionData,
    ActionFn,
    CommandArguments,
    CommandDefinition,
    CommandName,
    CommandOptions,
} from './types/command';
import { InferCommandArguments, InferCommandOptions } from './types/utils';
import { trySync } from './utils/try';
import { Validator } from './validator';

export const createCommand = <
    const TArgs extends CommandArguments = CommandArguments,
    const TOpts extends CommandOptions = CommandOptions,
>(
    options: CommandDefinition<string, TArgs, TOpts> & { program: Program }
): Command => {
    return new Command(
        options as CommandDefinition<
            string,
            CommandArguments,
            CommandOptions
        > & { program: Program }
    );
};

export type { Command };

class Command {
    program: Program;
    name: CommandName<string>;
    action: (
        arg: ActionData<
            InferCommandArguments<CommandArguments>,
            InferCommandOptions<CommandOptions>
        >
    ) => void;
    options: CommandOptions;
    args: CommandArguments;

    constructor(
        opts: CommandDefinition<string, CommandArguments, CommandOptions> & {
            program: Program;
        }
    ) {
        this.name = opts.name;
        this.action = opts.action;
        this.options = opts.options ?? {};
        this.args = opts.args ?? [];
        this.program = opts.program;
    }

    process(entries: string[]) {
        const parser = new EntryParser(this, this.program);
        const parsedEntries = this.program._registerError(
            () => parser.parse(entries),
            'exit'
        );

        const validator = new Validator(this, this.program);
        const validatedData = this.program._registerError(
            () => validator.validate(parsedEntries),
            'exit'
        );

        return {
            parser,
            parsedEntries,
            validator,
            validatedData,
        };
    }
}
