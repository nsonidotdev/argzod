import type { Program } from '../program';
import type { ParsedEntry, ParsedPositionalArgument } from '../types/arguments';
import {
    groupOptionsByDefs,
    stringifyOptionDefintion,
} from '../utils/options';
import { ArgzodError, ErrorCode } from '../errors';
import { EntryType, OptionParseType } from '../enums';
import type { Command } from '../command';
import type { OptionValidationInput } from '../types';

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

        const groupedOptions = groupOptionsByDefs(parsedOptions, this.command.options);
        this.validateOptionParsingTypes(groupedOptions);

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

    private validateOptionParsingTypes(groupedOptions: ReturnType<typeof groupOptionsByDefs>) {
        Object.entries(this.command.options).forEach(([key, def]) => {
            const group = groupedOptions[key];
            if (!group || !group.passed) return;

            const stringifiedOptionDef = stringifyOptionDefintion(def);
            const registerError = () => this.program._registerError(
                new ArgzodError({
                    code: ErrorCode.InvalidOptionValue,
                    ctx: [{ shouldBe: def.parse }],
                    path: stringifiedOptionDef
                })
            )


            if (def.parse === OptionParseType.Boolean && group.value.length !== 0) {
                registerError();
            }

            if (def.parse === OptionParseType.Single && group.value.length !== 1) {
                registerError()
            }
        });
    }

    private validateOptionValues(groupedOptions: ReturnType<typeof groupOptionsByDefs>): Record<string, any> {
        return Object.fromEntries(
            Object.entries(groupedOptions)
                .map(([key, { definition, passed, value }]) => {
                    const path = stringifyOptionDefintion(definition);

                    let input: OptionValidationInput;

                    if (definition.parse === 'boolean') {
                        input = passed;
                    } else if (definition.parse === 'signle') {
                        input = passed ? value[0] : undefined;
                    } else {
                        input = passed ? value : [];
                    }
                    
                    if (!definition.schema) return [key, input];
                    const zodResult = definition.schema.safeParse(input);

                    if (!zodResult.success) {
                        this.program._registerError(
                            new ArgzodError({
                                code: ErrorCode.Validation,
                                path,
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
