import { countLeadingDashes, isNumericString, isValidOptionName } from '../utils';
import { EntryType, OptionParseType, OptionValueStyle, OptionVariant } from '../enums';
import { ArgzodError, ErrorCode } from '../errors';
import type { ParsedEntry, ParsedOption } from '../types/arguments';
import { parseInlineOption } from './parse-inline-option';
import { parseBundledOptions } from './parse-bundled-options';
import type { Program } from '../program';
import type { Command } from '../command';
import { groupOptionsByDefs, stringifyOptionDefintion } from '../utils/options';

export class EntryParser {
    private command: Command;
    private program: Program;
    private parsedEntries: ParsedEntry[];

    constructor(command: Command, program: Program) {
        this.command = command;
        this.program = program;
        this.parsedEntries = [];
    }

    public parse(args: string[]): ParsedEntry[] {
        const formattedEntries = this._format(args);
        const mergedEntries = this._merge(formattedEntries);

        const parsedOptions = mergedEntries.filter(e => e.type === EntryType.Option)
        const groupedValues = groupOptionsByDefs(parsedOptions, this.command.options)

        // Check parsing type of each option
        const isValid = Object.entries(this.command.options).reduce<boolean>((acc, [key, def]) => {
            const group = groupedValues[key];
            if (!group || !(group.value instanceof Array)) return acc; // Option not defined           

            const stringifiedOptionDef = stringifyOptionDefintion(def);

            if (def.parse === OptionParseType.Boolean && group.value.length !== 0) {
                this.program._registerError(new ArgzodError({ code: ErrorCode.InvalidOptionValue, ctx: [{ shouldBe: def.parse }], path: stringifiedOptionDef }))
                return false;
            }

            if (def.parse === OptionParseType.Single && group.value.length !== 1) {
                this.program._registerError(new ArgzodError({ code: ErrorCode.InvalidOptionValue, ctx: [{ shouldBe: def.parse }], path: stringifiedOptionDef }))
                return false;
            }

            return acc;
        }, true);

        if (!isValid) {
            this.program._errorExit();
            process.exit(1);
        }

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

    private _merge(formattedEntries: ParsedEntry[]): ParsedEntry[] {
        let optionsStarted = false;

        const mergedEntries: Array<ParsedEntry | null> = formattedEntries.map((entry, index) => {
            if (!optionsStarted) {
                // identify if positional arguments are over
                optionsStarted = formattedEntries.slice(0, index + 1).some((ent) => ent.type === EntryType.Option);
            }

            if (entry.type === EntryType.Argument && optionsStarted) {
                // If entry is placed after the first option it is value of the option and should be merged to it. So skip this argument
                return null;
            }

            if (entry.type === EntryType.Option) {
                // Merge option with its value (space-separated value style)
                const optionValue = this._getSpaceSeparatedOptionValue(formattedEntries, index);
                if (optionValue.length && entry.valueStyle) {
                    this.program._registerError(new ArgzodError(ErrorCode.InvalidOption));

                    return null;
                }

                return {
                    ...entry,
                    value: entry.value.length === 0 ? optionValue : entry.value,
                    valueStyle: optionValue.length ? OptionValueStyle.SpaceSeparated : entry.valueStyle,
                };
            }

            return entry;
        }, []);

        return mergedEntries.filter((ent) => ent != null);
    }

    private _getSpaceSeparatedOptionValue(entries: ParsedEntry[], optionIndex: number): ParsedOption['value'] {
        if (entries[optionIndex]?.type !== EntryType.Option) {
            this.program._registerError(new ArgzodError(ErrorCode.Internal));
            return [];
        }

        let shouldIterate = true;
        const values = entries.slice(optionIndex + 1).reduce<string[]>((acc, entry) => {
            if (entry.type === EntryType.Option) {
                shouldIterate = false;
            }
            if (!shouldIterate) return acc;

            return entry.type === EntryType.Argument ? acc.concat(entry.value) : acc;
        }, []);


        return values;
    }
}
