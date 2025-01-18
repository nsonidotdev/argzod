import { countLeadingDashes } from ".";
import { ArgumentType, OptionVariant } from "../enums";
import { ArgzodError, ErrorCode } from "../lib/error";
import { OptionValue, FormattedCommandString, FormattedOption, ProgramConfig } from "../types";


export class ArgumentFormatter {
    private _config: ProgramConfig;

    constructor(config?: ProgramConfig) {
        this._config = config ?? {};
    }

    public format(args: string[]): FormattedCommandString[] {
        const formattedArgs = this._format(args);
        const mergedArgs = this._merge(formattedArgs);

        return mergedArgs;
    }

    private _format(args: string[]): FormattedCommandString[] {
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

    private _validateOptionName(optionName: string, leadingDashesCount: number): FormattedOption {
        if (leadingDashesCount === 1) {
            if (optionName.length === 1) {
                return {
                    type: ArgumentType.Option,
                    value: true,
                    name: optionName,
                    variant: OptionVariant.Short
                };
            } else {
                throw new ArgzodError({
                    code: ErrorCode.InvalidShortOptionFormat,
                    path: `-${optionName}`
                })
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
                throw new ArgzodError({
                    code: ErrorCode.InvalidLongOptionFormat,
                    path: `--${optionName}`
                })
            }
        }

        throw new ArgzodError({
            code: ErrorCode.InvalidLongOptionFormat,
            path: `${[...Array(leadingDashesCount).fill('-').join('')]}${optionName}`
        })
    }

    private _merge(formattedArguments: FormattedCommandString[]): FormattedCommandString[] {
        let optionsStarted = false;

        const mergedArgs: Array<FormattedCommandString | null> = formattedArguments.map((arg, index) => {
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

    private _getOptionValue(args: FormattedCommandString[], optionIndex: number): OptionValue {
        if (args[optionIndex]?.type !== ArgumentType.Option) {
            throw new ArgzodError({
                code: ErrorCode.Other,
                message: "Internal error"
            })
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
