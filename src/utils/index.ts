import { ArgumentType } from '../enums';
import type { ParsedArgument } from '../types/arguments';
import type { Command } from '../types/command';
import { ArgumentParser } from './parser';
import {
    matchOptionDefinitionByOptionName,
    matchParsedOptionsByDefinition,
    stringifyOptionDefintion,
} from './options';
import { schemas } from '../schemas';
import { trySync } from './try';
import { ArgzodError, ErrorCode } from '../errors';
import type { z } from 'zod';

type Options = {
    commandLine: string[];
    commands: Command[];
};
export const getCommandData = ({ commandLine, commands }: Options) => {
    const namedCommand = commands.find((c) => c.name === commandLine[0]);
    const indexCommand = commands.find((c) => c.name === undefined);
    const targetCommand = namedCommand ?? indexCommand;

    commandLine =
        targetCommand === indexCommand ? commandLine : commandLine.slice(1);

    if (!targetCommand) {
        throw new ArgzodError({
            code: ErrorCode.CommandNotFound,
            ctx: [undefined]
        });
    }

    const parser = new ArgumentParser(targetCommand);
    const parsedCommandLine = parser.parse(commandLine);
    const parsedArgs = parsedCommandLine.filter(
        (arg) => arg.type === ArgumentType.Argument
    );

    const targetCommandResult = trySync(() =>
        parseCommand(targetCommand, parsedCommandLine)
    );
    if (targetCommandResult.success) return targetCommandResult.data;

    if (
        targetCommand === namedCommand ||
        (targetCommand === indexCommand &&
            targetCommand.arguments.length === parsedArgs.length)
    ) {
        throw targetCommandResult.error;
    }

    throw new ArgzodError({
        code: ErrorCode.CommandNotFound,
        ctx: [parsedArgs[0]?.value]
    });
};

const parseCommand = (
    command: Command,
    parsedCommandLine: ParsedArgument[]
) => {
    const parsedArgs = parsedCommandLine.filter(
        (arg) => arg.type === ArgumentType.Argument
    );
    const parsedOptions = parsedCommandLine.filter(
        (arg) => arg.type === ArgumentType.Option
    );

    if (parsedArgs.length > command.arguments.length)
        throw new Error('Too many arguments');

    const validatedArgs = command.arguments.map((argDef, index) => {
        const argParseResult = argDef.schema.safeParse(
            parsedArgs[index]?.value
        );

        if (!argParseResult.success) {
            throw new ArgzodError({
                code: ErrorCode.ZodParse,
                path: `Argument ${index + 1}`,
                ctx: [argParseResult.error]
            });
        }

        return argParseResult.data;
    });

    // Handle not defined options
    parsedOptions.some((opt) => {
        const result = matchOptionDefinitionByOptionName(
            opt.name,
            command.options
        );

        if (!result) {
            throw new ArgzodError({
                code: ErrorCode.OptionNotDefined,
                path: opt.fullName,
            });
        }
    });

    const validatedOptions = Object.fromEntries(
        Object.entries(command.options).map(([key, optionDef]) => {
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
                        ctx: [zodResult.error]
                    });
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
        command,
        validatedArgs,
        validatedOptions,
        parsedCommandLine,
    };
};

export const countLeadingDashes = (arg: string) => {
    const indexOfDash = [...arg].findIndex((char) => char !== '-');
    return indexOfDash === -1 ? arg.length : indexOfDash;
};

export const stringifyZodError = (error: z.ZodError) => {
    return error.issues.map((i) => i.message).join('\n');
};

export const removeObjectKeys = <
    T extends Record<string, any>,
    U extends keyof T,
>(
    object: T,
    keys: U[]
): Omit<T, U> => {
    const result = { ...object };
    for (const key of keys) {
        delete result[key];
    }
    return result;
};

export const isValidOptionName = (string: string) =>
    /^[a-zA-Z0-9-_]+$/.test(string);
export const isNumericString = (str: string) => /^[0-9]+$/.test(str);
