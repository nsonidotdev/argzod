import { countLeadingDashes, isNumericString, isValidOptionName } from '../utils';
import { EntryType, OptionParseType, OptionVariant } from '../enums';
import { ArgzodError, ErrorCode } from '../errors';
import type { ParsedEntry, ParsedPositionalArgument } from '../types/arguments';
import { parseInlineOption } from './parse-inline-option';
import { parseBundledOptions } from './parse-bundled-options';
import type { Program } from '../program';
import type { Command } from '../command';
import { matchOptionDefinitionByOptionName } from '../utils/options';

export class EntryParser {
    private command: Command;
    private program: Program;

    constructor(command: Command, program: Program) {
        this.command = command;
        this.program = program;
    }

    public parse(args: string[]): ParsedEntry[] {
        const formattedEntries = this._format(args);
        const mergedEntries = this._resolveEntries(formattedEntries);

        // Handle not defined options
        mergedEntries
            .filter(e => e.type === EntryType.Option)
            .forEach((opt) => {
                const result = matchOptionDefinitionByOptionName(opt.name, this.command.options);

                if (!result) {
                    this.program._registerError(
                        new ArgzodError({
                            code: ErrorCode.OptionNotDefined,
                            path: opt.fullName,
                        })
                    );
                }
            });

        return mergedEntries;
    }

    private _format(entries: string[]): ParsedEntry[] {
        return entries.reduce<ParsedEntry[]>((acc, entry) => {
            const leadingDashesCount = countLeadingDashes(entry);

            if (!leadingDashesCount || leadingDashesCount === entry.length) {
                // If entry has no dashes or is entirely dashes, treat it as an argument
                return acc.concat({
                    type: EntryType.Argument,
                    value: entry,
                });
            }

            if (leadingDashesCount === 1 && isNumericString(entry.slice(1))) {
                // If entry has one dash and consists only from numbers after that dash then treat it as argument (negative number)
                return acc.concat({
                    type: EntryType.Argument,
                    value: entry,
                });
            }

            if (entry.includes('=') && (leadingDashesCount === 1 || leadingDashesCount === 2)) {
                const option = this.program._registerError(() =>
                    parseInlineOption({
                        entry,
                        leadingDashes: leadingDashesCount,
                    })
                );

                if (option) {
                    return acc.concat(option);
                } else {
                    return acc;
                }
            }

            const optionName = entry.slice(leadingDashesCount);
            if (!isValidOptionName(optionName)) {
                this.program._registerError(
                    new ArgzodError({
                        code: ErrorCode.InvalidOption,
                    })
                );

                return acc;
            }

            if (leadingDashesCount === 1) {
                if (optionName.length === 1) {
                    return acc.concat({
                        type: EntryType.Option,
                        original: entry,
                        value: [],
                        name: optionName,
                        variant: OptionVariant.Short,
                        fullName: entry,
                    });
                }

                const bunledOptions = parseBundledOptions({
                    entry: entry,
                    optionDefinitions: this.command.options,
                });

                return acc.concat(...bunledOptions);
            }

            if (leadingDashesCount === 2) {
                if (optionName.length > 1) {
                    acc.push({
                        type: EntryType.Option,
                        original: entry,
                        value: [],
                        name: optionName,
                        variant: OptionVariant.Long,
                        fullName: entry,
                    });

                    return acc;
                } else {
                    this.program._registerError(
                        new ArgzodError({
                            code: ErrorCode.InvalidOption,
                            path: entry,
                        })
                    );

                    return acc;
                }
            }

            this.program._registerError(
                new ArgzodError({
                    code: ErrorCode.InvalidOption,
                    path: entry,
                })
            );

            return acc;
        }, []);
    }

    private _resolveEntries(formattedEntries: ParsedEntry[]): ParsedEntry[] {
        let isOptionMet = false;

        const resolvedEntries = formattedEntries.reduce<Array<ParsedEntry>>((acc, entry, index, arr) => {
            if (entry.type === EntryType.Argument) {
                // If option is met then argument may be value of the option 
                // This scenario is handled further
                if (isOptionMet) return acc;
                return [...acc, entry]
            };

            isOptionMet = true;

            const defResult = matchOptionDefinitionByOptionName(entry.name, this.command.options);
            if (!defResult) return acc;

            const [, def] = defResult;

            const nextValues = this.getFollowedArgs(arr.slice(index + 1));

            if (def.parse === OptionParseType.Boolean) {
                return [...acc, entry, ...nextValues]
            }

            if (def.parse === OptionParseType.Single) {
                entry.value = nextValues[0] ? [...entry.value, nextValues[0].value] : entry.value;
                const restValues = nextValues.length > 1 ? nextValues.slice(1) : [];

                return [...acc, entry, ...restValues]
            }

            if (def.parse === OptionParseType.Many) {
                entry.value = [...entry.value, ...nextValues.map(e => e.value)]

                return [...acc, entry];
            }

            return acc;
        }, []);

        return resolvedEntries;
    }

    private getFollowedArgs(followedEntries: ParsedEntry[]): ParsedPositionalArgument[] {
        let args: ParsedPositionalArgument[] = [];

        for (let entry of followedEntries) {
            if (entry.type === EntryType.Option) break;
            args.push(entry);
        }

        return args;
    }
}
