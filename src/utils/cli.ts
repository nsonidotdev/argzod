import { countLeadingDashes } from ".";
import { ArgumentType } from "../enums";
import { OptionValue, ParsedCommandString } from "../types";
import { parseOption } from "./options";

/**
*  Parses CLI arguments into a structured format.
 * @param args Array of command-line arguments passed to the CLI tool, excluding the tool name and metadata. 
 * Each argument can be a standalone value, an option prefixed with "-" or "--"
 * @returns Array of parsed arguments
*/
export const parseArguments = (args: string[]): ParsedCommandString[] => {
    const formatArguments = (arg: string): ParsedCommandString => {
        const dashesCount = countLeadingDashes(arg);

        if (!dashesCount || dashesCount === arg.length) {
            // If arg has no dashes or is entirely dashes, treat it as an argument
            return {
                type: ArgumentType.Argument,
                value: arg
            };
        };

        const option = parseOption(arg);
        return option;
    }

    const mergeArguments = (arg: ParsedCommandString, index: number, formattedArguments: ParsedCommandString[]) => {
        const previousArg = formattedArguments[index - 1];

        // Skip option values
        if (previousArg && previousArg.type === ArgumentType.Option && arg.type === ArgumentType.Argument) return null;

        // Merge option with its value
        if (arg.type === ArgumentType.Option) {
            const nextArgument = formattedArguments[index + 1];
            let value: OptionValue = true;

            if (!nextArgument || nextArgument.type === ArgumentType.Option) value = true;
            else if (nextArgument?.type === ArgumentType.Argument) value = nextArgument.value;

            return {
                ...arg,
                value
            }
        };

        return arg;
    }

    console.log(args
        .map(formatArguments)
)

    return args
        .map(mergeArguments)
        .filter(arg => arg != null) as ParsedCommandString[];
}