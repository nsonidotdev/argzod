import { z } from "zod";
import { ArgumentType, OptionVariant } from "../enums";
import { Command, OptionDefinition, OptionValue, FormattedCommandString, FormattedOption } from "../types";
import { ArgumentFormatter as ArgumentFormatter } from "./argument-formatter";
import { getOptionValue } from "./options";
import { flagSchema } from "../lib/schemas";
import { syncHandleError } from "./handle-error";

type Options = {
    commandLine: string[];
    commands: Command[];
}
export const getCommandData = ({ commandLine, commands }: Options) => {
    const argFormatter = new ArgumentFormatter();

    const namedCommand = commands.find(c => c.name === commandLine[0]);
    const indexCommand = commands.find(c => c.name === undefined);

    if (!namedCommand && !indexCommand) throw new Error("Command not found")

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
            throw new Error("Invalid arguments for root command")
        }
    }

    if (!namedCommand) {
        throw new Error("Command not found");
    } else {
        throw new Error(`Invalid arguments for "${namedCommand.name}" command`)
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
        return argDef.schema.parse(formattedArguments[index]?.value);
    });

    const parsedOptions = Object.fromEntries(
        Object.entries(command.options)
            .map(([name, optDef]) => {
                const optionValue = getOptionValue(optDef.name ?? name, formattedOptions);

                return [
                    name,
                    (optDef.schema ?? flagSchema).parse(optionValue)
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

