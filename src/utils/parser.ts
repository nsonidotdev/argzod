import { countLeadingDashes, isNumericString, isValidOptionName } from ".";
import { ArgumentType, OptionVariant } from "../enums";
import { ArgzodError, ErrorCode } from "../errors";
import { ParsedArgument, ParsedOption } from "../types/arguments";
import { ProgramConfig } from "../types/program";


export class ArgumentParser {
    private _config: ProgramConfig;

    constructor(config?: ProgramConfig) {
        this._config = config ?? {};
    }

    public parse(args: string[]): ParsedArgument[] {
        const formattedArgs = this._format(args);
        const mergedArgs = this._merge(formattedArgs);

        return mergedArgs;
    }

    private _format(args: string[]): ParsedArgument[] {
        return args.reduce<ParsedArgument[]>((acc, arg) => {
            const leadingDashesCount = countLeadingDashes(arg);

            if (!leadingDashesCount || leadingDashesCount === arg.length) {
                // If arg has no dashes or is entirely dashes, treat it as an argument
                acc.push({
                    type: ArgumentType.Argument,
                    value: arg
                });

                return acc;
            };

            if (leadingDashesCount === 1 && isNumericString(arg.slice(1))) {
                // If arg has one dash and consists only from numbers after that dash then treat it as negative number
                acc.push({
                    type: ArgumentType.Argument,
                    value: arg
                });

                return acc;
            }

            const optionName = arg.slice(leadingDashesCount);
            if (!isValidOptionName(optionName)) {
                throw new ArgzodError({
                    code: ErrorCode.InvalidOptionName
                })
            };

            if (leadingDashesCount === 1) {
                if (optionName.length === 1) {
                    acc.push({
                        type: ArgumentType.Option,
                        value: "",
                        name: optionName,
                        variant: OptionVariant.Short,
                        fullName: arg,
                    });

                    return acc;

                } else {
                    const bunledOptions = optionName.split('');

                    bunledOptions.forEach((opt) => {
                        acc.push({
                            type: ArgumentType.Option,
                            value: "",
                            name: opt,
                            variant: OptionVariant.Short,
                            fullName: `-${opt}`,
                            bunled: {
                                fullName: arg,
                                opts: bunledOptions
                            },
                        })
                    });

                    return acc;
                }
            }

            if (leadingDashesCount === 2) {
                if (optionName.length > 1) {
                    acc.push({
                        type: ArgumentType.Option,
                        value: "",
                        name: optionName,
                        variant: OptionVariant.Long,
                        fullName: arg,
                    });

                    return acc;
                } else {
                    throw new ArgzodError({
                        code: ErrorCode.InvalidLongOptionFormat,
                        path: arg
                    })
                }
            }

            throw new ArgzodError({
                code: ErrorCode.InvalidLongOptionFormat,
                path: arg
            })
        }, [])
    }

    private _merge(formattedArguments: ParsedArgument[]): ParsedArgument[] {
        let optionsStarted = false;

        const mergedArgs: Array<ParsedArgument | null> = formattedArguments.map((arg, index) => {
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

    private _getOptionValue(args: ParsedArgument[], optionIndex: number): string {
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


        return values.join(' ');
    }
}
