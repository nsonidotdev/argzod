import { ArgumentType } from "../enums";
import { ParsedArgument, OptionDefinition } from "../types/arguments";
import { Command } from "../types/command";
import { ArgumentParser } from "./parser";
import { matchOptionDefinition, stringifyOptionDefintion } from "./options";
import { schemas } from "../schemas";
import { trySync } from "./try";
import { ArgzodError, ErrorCode } from "../errors";
import { z } from "zod";

type Options = {
    commandLine: string[];
    commands: Command[];
}
export const getCommandData = ({ commandLine, commands }: Options) => {
    const parser = new ArgumentParser();

    const namedCommand = commands.find(c => c.name === commandLine[0]);
    const indexCommand = commands.find(c => c.name === undefined);
    const targetCommand = namedCommand ?? indexCommand;

    commandLine = targetCommand === indexCommand
        ? commandLine
        : commandLine.slice(1)



    if (!targetCommand) {
        throw new ArgzodError({
            code: ErrorCode.CommandNotFound,
        });
    }

    const parsedCommandLine = parser.parse(commandLine);
    const parsedArgs = parsedCommandLine.filter(arg => arg.type === ArgumentType.Argument);

    const targetCommandResult = trySync(() => parseCommand(targetCommand, parsedCommandLine));
    if (targetCommandResult.success) return targetCommandResult.data;

    if (targetCommand === namedCommand || (targetCommand === indexCommand && targetCommand.arguments.length === parsedArgs.length)) {
        throw targetCommandResult.error;
    }

    throw new ArgzodError({
        code: ErrorCode.CommandNotFound,
        message: `Command ${parsedArgs[0]?.value ?? "?"} not found`
    })
}


const parseCommand = (
    command: Command,
    parsedCommandLine: ParsedArgument[]
) => {
    const parsedArgs = parsedCommandLine.filter(arg => arg.type === ArgumentType.Argument);
    const parsedOptions = parsedCommandLine.filter(arg => arg.type === ArgumentType.Option);

    if (parsedArgs.length > command.arguments.length) throw new Error('Too many arguments');

    const validatedArgs = command.arguments.map((argDef, index) => {
        const argParseResult = argDef.schema.safeParse(parsedArgs[index]?.value);

        if (!argParseResult.success) {
            throw new ArgzodError({
                code: ErrorCode.ZodParse,
                path: `Argument ${index + 1}`,
                message: argParseResult.error.issues
                    .map(i => i.message)
                    .join("\n")
            })
        }

        return argParseResult.data;
    });

    let validatedOptions = Object.fromEntries(parsedOptions.map((option) => {
        const matchResult = matchOptionDefinition(option, command.options)
        if (!matchResult) {
            throw new ArgzodError({
                code: ErrorCode.OptionNotDefined,
                path: option.fullName
            });
        };

        const [key, optionDefinition] = matchResult

        const parsedValue = (optionDefinition.schema ?? schemas.flagSchema).safeParse(option.value);

        if (!parsedValue.success) {
            throw new ArgzodError({
                code: ErrorCode.ZodParse,
                path: option.fullName,
                message: parsedValue.error.issues
                    .map(i => i.message)
                    .join("\n")
            })
        }

        return [key, parsedValue.data];
    }));

    const notPassedOptionDefinitions = removeObjectKeys(command.options, Object.keys(validatedOptions))
    const notPassedValidatedOptions = Object.fromEntries(
        Object.entries<OptionDefinition>(notPassedOptionDefinitions)
            .map(([key, optionDefinition]) => {
                const parsedValue = (optionDefinition?.schema ?? schemas.flagSchema).safeParse(undefined);
                if (!parsedValue.success) {
                    throw new ArgzodError({
                        code: ErrorCode.ZodParse,
                        path: stringifyOptionDefintion([key, optionDefinition]),
                        message: parsedValue.error.issues
                            .map(i => i.message)
                            .join("\n")
                    })
                }

                return [key, parsedValue.data];
            })
    );

    validatedOptions = {
        ...validatedOptions,
        ...notPassedValidatedOptions
    };

    return {
        command,
        validatedArgs,
        validatedOptions,
        parsedCommandLine
    }
}


export const countLeadingDashes = (arg: string) => {
    const indexOfDash = [...arg].findIndex(char => char !== '-');
    return indexOfDash === -1
        ? arg.length
        : indexOfDash;
}

export const stringifyZodError = (error: z.ZodError) => {
    return error.issues
        .map(i => i.message)
        .join("\n")
}

export const removeObjectKeys = <T extends Record<string, any>, U extends keyof T>(object: T, keys: U[]): Omit<T, U> => {
    const result = { ...object };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}

export const isValidOptionName = (string: string) => /^[a-zA-Z0-9-_]+$/.test(string);
export const isNumericString = (str: string) => /^[0-9]+$/.test(str);