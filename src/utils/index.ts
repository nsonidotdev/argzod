import { ArgumentType } from "../enums";
import { Command, FormattedCommandString } from "../types";
import { ArgumentFormatter as ArgumentFormatter } from "./argument-formatter";
import { getOptionValue } from "./options";
import { flagSchema } from "../lib/schemas";
import { syncHandleError } from "./handle-error";
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

    if (!namedCommand && !indexCommand) {
        throw new ArgzodError({
            code: ErrorCode.CommandNotFound,
        });
    }

    let namedCommandData: ReturnType<typeof syncHandleError<ReturnType<typeof parseCommand>>> | null = null;
    let indexCommandData: ReturnType<typeof syncHandleError<ReturnType<typeof parseCommand>>> | null = null;


    if (namedCommand) {
        const formattedCommandLine = argFormatter.format(commandLine.slice(1));
        namedCommandData = syncHandleError(() => parseCommand(namedCommand, formattedCommandLine));

        if (namedCommandData.data) return namedCommandData.data;
    }


    if (indexCommand) {
        const formattedCommandLine = argFormatter.format(commandLine);
        indexCommandData = syncHandleError(() => parseCommand(indexCommand, formattedCommandLine));

        if (indexCommandData.data) return indexCommandData.data;
        if (indexCommand.arguments.length === commandLine.length && indexCommand.arguments.length > 0) {
            throw indexCommandData.error;
        }
    }

    if (namedCommand) {
        throw namedCommandData?.error
    } else {
        throw indexCommandData?.error
    }
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

    const parsedOptions = Object.fromEntries(
        Object.entries(command.options)
            .map(([name, optDef]) => {
                const optionValue = getOptionValue(optDef.name ?? name, formattedOptions);
                const parsedOption = (optDef.schema ?? flagSchema).safeParse(optionValue);
                if (!parsedOption.success) {
                    throw new ArgzodError({
                        code: ErrorCode.ZodParse, 
                        path: name, 
                        message: parsedOption.error.issues
                            .map(i => i.message)
                            .join("\n")
                    })
                }

                return [
                    name,
                    parsedOption.data
                ];
            })
    );

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

