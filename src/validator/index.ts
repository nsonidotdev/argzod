import type { Program } from '../program';
import type { ParsedEntry } from '../types/arguments';
import { schemas } from '../schemas';
import {
    matchOptionDefinitionByOptionName,
    matchParsedOptionsByDefinition,
    stringifyOptionDefintion,
} from '../utils/options';
import { ArgzodError, ErrorCode } from '../errors';
import { EntryType } from '../enums';
import { Command } from '../command';

export class Validator {
    private program: Program;
    private command: Command;

    constructor( command: Command, program: Program) {
        this.program = program;
        this.command = command;
    }

    validate(parsedEntries: ParsedEntry[]) {
        const parsedArgs = parsedEntries.filter(
            (arg) => arg.type === EntryType.Argument
        );
        const parsedOptions = parsedEntries.filter(
            (arg) => arg.type === EntryType.Option
        );

        if (parsedArgs.length > this.command.args.length) {
            this.program._registerError(
                new ArgzodError(ErrorCode.InvalidArguments)
            );
        }

        const validatedArgs = this.command.args.map((argDef, index) => {
            const argParseResult = argDef.schema.safeParse(
                parsedArgs[index]?.value
            );

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

        // Handle not defined options
        parsedOptions.some((opt) => {
            const result = matchOptionDefinitionByOptionName(
                opt.name,
                this.command.options
            );

            if (!result) {
                this.program._registerError(
                    new ArgzodError({
                        code: ErrorCode.OptionNotDefined,
                        path: opt.fullName,
                    })
                );
            }
        });

        const validatedOptions = Object.fromEntries(
            Object.entries(this.command.options).map(([key, optionDef]) => {
                const matchingOptions = matchParsedOptionsByDefinition(
                    [key, optionDef],
                    parsedOptions
                );

                const validateOption = (
                    value: string | undefined,
                    path: string
                ) => {
                    const schema = optionDef.schema ?? schemas.flagSchema;
                    const zodResult = schema.safeParse(value);

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

                    return zodResult.data;
                };

                let validationResult;

                if (matchingOptions.length === 0) {
                    validationResult = validateOption(
                        undefined,
                        stringifyOptionDefintion([key, optionDef])
                    );
                } else if (matchingOptions.length === 1) {
                    const option = matchingOptions[0]!;
                    if (typeof option.value === 'string') {
                        validationResult = validateOption(
                            option.value,
                            option.fullName
                        );
                    } else {
                        validationResult = option.value.map((val) => {
                            return validateOption(val, option.fullName);
                        });
                    }
                } else {
                    validationResult = matchingOptions
                        .map((option) => {
                            if (typeof option.value === 'string') {
                                return validateOption(
                                    option.value,
                                    option.fullName
                                );
                            } else {
                                return option.value.map((val) => {
                                    return validateOption(val, option.fullName);
                                });
                            }
                        })
                        .flat();
                }

                return [key, validationResult];
            })
        );

        return {
            validatedArgs,
            validatedOptions,
        };
    }
}
