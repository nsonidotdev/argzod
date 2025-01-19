import { ArgumentType } from "../enums";
import { Command, FormattedCommandString, OptionDefinition } from "../types";
import { ArgumentFormatter as ArgumentFormatter } from "./argument-formatter";
import { matchOptionDefinition, stringifyOptionDefintion } from "./options";
import { flagSchema } from "../lib/schemas";
import { trySync } from "./handle-error";
import { ArgzodError, ErrorCode } from "../lib/error";
import { z } from "zod";

type Options = {
    commandLine: string[];
    commands: Command[];
}
export const getCommandData = ({ commandLine, commands }: Options) => {
    const argFormatter = new ArgumentFormatter();

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

    const formattedCommandLine = argFormatter.format(commandLine);
    const formattedArgs = formattedCommandLine.filter(arg => arg.type === ArgumentType.Argument);

    const targetCommandResult = trySync(() => parseCommand(targetCommand, formattedCommandLine));
    if (targetCommandResult.success) return targetCommandResult.data;

    if (targetCommand === namedCommand || (targetCommand === indexCommand && targetCommand.arguments.length === formattedArgs.length)) {
        throw targetCommandResult.error;
    }

    throw new ArgzodError({ 
        code: ErrorCode.CommandNotFound,
        message: `Command ${formattedArgs[0]?.value ?? "?"} not found`
    })
}


const parseCommand = (
    command: Command,
    formattedCommandLine: FormattedCommandString[]
) => {
    const formattedArguments = formattedCommandLine.filter(arg => arg.type === ArgumentType.Argument);
    const formattedOptions = formattedCommandLine.filter(arg => arg.type === ArgumentType.Option);

    if (formattedArguments.length > command.arguments.length) throw new Error('Too many arguments');

    const parsedArguments = command.arguments.map((argDef, index) => {
        const argParseResult = argDef.schema.safeParse(formattedArguments[index]?.value);

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

    let parsedOptions = Object.fromEntries(formattedOptions.map((option) => {
        const matchResult = matchOptionDefinition(option, command.options)
        if (!matchResult) {
            throw new ArgzodError({
                code: ErrorCode.OptionNotDefined,
                path: option.fullName
            });
        };

        const [key, optionDefinition] = matchResult

        const parsedValue = (optionDefinition.schema ?? flagSchema).safeParse(option.value);

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

    const notPassedOptionDefinitions = removeObjectKeys(command.options, Object.keys(parsedOptions))
    const notPassedParsedOptions = Object.fromEntries(
        Object.entries<OptionDefinition>(notPassedOptionDefinitions)
            .map(([key, optionDefinition]) => {
                const parsedValue = (optionDefinition?.schema ?? flagSchema).safeParse(undefined);
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

    parsedOptions = {
        ...parsedOptions,
        ...notPassedParsedOptions
    };

    return {
        command,
        parsedArguments,
        parsedOptions,
        commandLine: formattedCommandLine
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