import { countLeadingDashes } from ".";
import { ArgumentType, OptionVariant } from "../enums";
import { OptionValue, ParsedArgument, ParsedCommandString, ParsedOption } from "../types";


class ArgumentParser {
    public parse(args: string[]): ParsedCommandString[] {
        const formattedArgs = this._format(args);
        const mergedArgs = this._merge(formattedArgs);
        console.log(mergedArgs);

        return mergedArgs;
    }

    private _format(args: string[]): ParsedCommandString[] {
        return args.map((arg) => {
            const leadingDashesCount = countLeadingDashes(arg);

            if (!leadingDashesCount || leadingDashesCount === arg.length) {
                // If arg has no dashes or is entirely dashes, treat it as an argument
                return {
                    type: ArgumentType.Argument,
                    value: arg
                };
            };

            const option = this._validateOptionName(arg.slice(leadingDashesCount), leadingDashesCount);
            return option;
        })
    }

    private _validateOptionName(optionName: string, leadingDashesCount: number): ParsedOption {
        if (leadingDashesCount === 1) {
            if (optionName.length === 1) {
                return {
                    type: ArgumentType.Option,
                    value: true,
                    name: optionName,
                    variant: OptionVariant.Short
                };
            } else {
                throw new Error("Short options should only contain one character")
            }
        }

        if (leadingDashesCount === 2) {
            if (optionName.length > 1) {
                return {
                    type: ArgumentType.Option,
                    value: true,
                    name: optionName,
                    variant: OptionVariant.Long
                };
            } else {
                throw new Error("Long options should contain at least 2 characters")
            }
        }

        throw new Error("Invalid option format. You should use - or -- to define option")
    }

    private _merge(formattedArguments: ParsedCommandString[]): ParsedCommandString[] {
        let optionsStarted = false;

        const mergedArgs: Array<ParsedCommandString | null> = formattedArguments.map((arg, index) => {
            if (!optionsStarted) {
                optionsStarted = formattedArguments
                    .slice(0, index + 1)
                    .some(arg => arg.type === ArgumentType.Option);
            }

            // If argument is standing after the option it is value of the option and should be merged to it. So skip this argument 
            if (arg.type === ArgumentType.Argument && optionsStarted) {
                return null
            };

            // Merge option with its value
            if (arg.type === ArgumentType.Option) {
                const optionValue = this._getOptionValue(formattedArguments, index);

                return {
                    ...arg,
                    value: optionValue
                }
            };

            return arg;
        }, [])

        return mergedArgs.filter(arg => arg != null);
    }

    private _getOptionValue(args: ParsedCommandString[], optionIndex: number): OptionValue {
        if (args[optionIndex]?.type !== ArgumentType.Option) {
            throw new Error("You should pass option index")
        }

        let shouldIterate = true;
        const values = args
            .slice(optionIndex + 1)
            .reduce<string[]>((acc, arg) => {
                if (arg.type === ArgumentType.Option) {
                    shouldIterate = false
                }
                if (!shouldIterate) return acc;

                return arg.type === ArgumentType.Argument
                    ? acc.concat(arg.value)
                    : acc
            }, [])


        if (values.length === 0) return true;
        if (values.length === 1) return values[0]!;
        return values;
    }
}

export const argumentParser = new ArgumentParser;