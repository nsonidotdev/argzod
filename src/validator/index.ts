import type { Program } from '../program';
import type { ParsedEntry, ParsedPositionalArgument } from '../types/arguments';
import {
    stringifyOptionDefintion,
} from '../utils/options';
import { ArgzodError, ErrorCode } from '../errors';
import { EntryType } from '../enums';
import type { Command } from '../command';
import { collectOptionsData } from '../parser/collect';

export class Validator {
    private program: Program;
    private command: Command;

    constructor(command: Command, program: Program) {
        this.program = program;
        this.command = command;
    }

    validate(parsedEntries: ParsedEntry[]) {
        const parsedArgs = parsedEntries.filter((arg) => arg.type === EntryType.Argument);
        const parsedOptions = parsedEntries.filter((arg) => arg.type === EntryType.Option);

        if (parsedArgs.length > this.command.args.length) {
            this.program._registerError(new ArgzodError(ErrorCode.InvalidArguments));
        }

        const validatedArgs = this.validateArgs(parsedArgs);

        const groupedOptions = collectOptionsData(parsedOptions, this.command.options);

        const validatedOptions = this.validateOptionValues(groupedOptions);

        return {
            validatedArgs,
            validatedOptions,
        };
    }

    private validateArgs(parsedArgs: ParsedPositionalArgument[]) {
        return this.command.args.map((argDef, index) => {
            const argParseResult = argDef.schema.safeParse(parsedArgs[index]?.value);

            if (!argParseResult.success) {
                this.program._registerError(
                    new ArgzodError({
                        code: ErrorCode.Validation,
                        path: `Argument ${index + 1}`,
                        ctx: [argParseResult.error],
                    })
                );

                return null;
            }

            return argParseResult.data;
        });
    }



    private validateOptionValues(groupedOptions: ReturnType<typeof collectOptionsData>): Record<string, any> {
        return Object.fromEntries(
            Object.entries(groupedOptions)
                .map(([key, { definition, value }]) => {
                    if (!definition.schema) return [key, value];
                    const zodResult = definition.schema.safeParse(value);

                    if (!zodResult.success) {
                        this.program._registerError(
                            new ArgzodError({
                                code: ErrorCode.Validation,
                                path: stringifyOptionDefintion(definition),
                                ctx: [zodResult.error],
                            })
                        );

                        return null;
                    }

                    return [key, zodResult.data];
                })
                .filter(ent => ent != null)
        );
    }
}
