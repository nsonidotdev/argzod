import { OptionValue, ParsedCommandString } from "../types";

/**
*  Parses CLI arguments into a structured format.
 * @param args Array of command-line arguments passed to the CLI tool, excluding the tool name and metadata. 
 * Each argument can be a standalone value, an option prefixed with "-" or "--"
 * @returns Array of parsed arguments
*/
export const parseArguments = (args: string[]): ParsedCommandString[] => {
    const formatArguments = (arg: string): ParsedCommandString => {
        const dashesCount = countDashes(arg);

        if (!dashesCount || dashesCount === arg.length) {
            // If arg has no dashes or is entirely dashes, treat it as an argument
            return {
                type: "argument",
                value: arg
            };
        };

        if (dashesCount > 2) {
            throw new Error("Invalid option format. You should use - or -- to define option")
        }

        return {
            type: "option",
            value: true, // Temporary value before merging
            name: arg.slice(dashesCount),
            variant: dashesCount === 1 ? "short" : 'long'
        };
    }

    const mergeArguments = (arg: ParsedCommandString, index: number, formattedArguments: ParsedCommandString[]) => {
        const previousArg = formattedArguments[index - 1];

        // Skip option values
        if (previousArg && previousArg.type === 'option' && arg.type === 'argument') return null;

        // Merge option with its value
        if (arg.type === "option") {
            const nextArgument = formattedArguments[index + 1];
            let value: OptionValue = true;

            if (!nextArgument || nextArgument.type === 'option') value = true;
            else if (nextArgument?.type === 'argument') value = nextArgument.value;

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



    function countDashes(arg: string) {
        const indexOfDash = [...arg].findIndex(char => char !== '-');
        return indexOfDash === -1
            ? arg.length
            : indexOfDash;
    }
}