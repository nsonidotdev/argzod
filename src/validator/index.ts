
import type { ProgramConfig } from '../types/program';
import type { Command } from '../types/command';
import type { ParsedEntry} from '../types/arguments';
import { schemas } from '../schemas';
import { matchOptionDefinitionByOptionName, matchParsedOptionsByDefinition, stringifyOptionDefintion } from '../utils/options';
import { ArgzodError, ErrorCode } from '../errors';
import { EntryType } from '../enums';

export class Validator {
    private programConfig: ProgramConfig;
    private command: Command;
    private entries: ParsedEntry[];

    constructor(
        programConfig: ProgramConfig,
        entries: ParsedEntry[],
        command: Command
    ) {
        this.programConfig = programConfig;
        this.entries = entries;
        this.command = command;
    }

    validate() {
        const parsedArgs = this.entries.filter(
            (arg) => arg.type === EntryType.Argument
        );
        const parsedOptions = this.entries.filter(
            (arg) => arg.type === EntryType.Option
        );

        if (parsedArgs.length > this.command.arguments.length)
            throw new ArgzodError(ErrorCode.InvalidPositionalArguments, this.programConfig.messages);

        const validatedArgs = this.command.arguments.map((argDef, index) => {
            const argParseResult = argDef.schema.safeParse(
                parsedArgs[index]?.value
            );

            if (!argParseResult.success) {
                throw new ArgzodError({
                    code: ErrorCode.ZodParse,
                    path: `Argument ${index + 1}`,
                    ctx: [argParseResult.error],
                }, this.programConfig.messages);
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
                throw new ArgzodError({
                    code: ErrorCode.OptionNotDefined,
                    path: opt.fullName,
                }, this.programConfig.messages);
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
                        throw new ArgzodError({
                            code: ErrorCode.ZodParse,
                            path,
                            ctx: [zodResult.error],
                        }, this.programConfig.messages);
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
            command: this.command,
            parsedCommandLine: this.entries,
        };
    }
}
