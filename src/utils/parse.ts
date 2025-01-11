import { ArgumentType, OptionVariant } from "../enums";
import { OptionValue, ParsedCommandString, ParsedOption } from "../types";


export const parseOption = (option: string): ParsedOption => {
    const dashesCount = countLeadingDashes(option);

    if (dashesCount > 2) {
        throw new Error("Invalid option format. You should use - or -- to define option")
    }

    const optionName = option.slice(dashesCount);

    if (dashesCount === 1 && optionName.length === 1) {
        return {
            type: ArgumentType.Option,
            value: true,
            name: optionName,
            variant: OptionVariant.Short
        };
    } else if (dashesCount === 2 && optionName.length > 1) {
        return {
            type: ArgumentType.Option,
            value: true,
            name: optionName,
            variant: OptionVariant.Long
        };
    } else {
        throw new Error("Short options should only have one dash and one latter and Long options should have 2 dashes and more than 2 chars")
    }

}

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

    return args
        .map(formatArguments)
        .map(mergeArguments)
        .filter(arg => arg != null) as ParsedCommandString[];




}

const countLeadingDashes = (arg: string) => {
    const indexOfDash = [...arg].findIndex(char => char !== '-');
    return indexOfDash === -1
        ? arg.length
        : indexOfDash;
}