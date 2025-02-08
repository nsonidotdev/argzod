import {
    countLeadingDashes,
    isNumericString,
    isValidOptionName,
} from '../utils';
import { EntryType, OptionValueStyle, OptionVariant } from '../enums';
import { ArgzodError, ErrorCode } from '../errors';
import type { Command } from '../types/command';
import type { ParsedEntry } from '../types/arguments';
import { parseInlineOption } from './parse-inline-option';
import { parseBundledOptions } from './parse-bundled-options';
import type { Program } from '../program';
import { trySync } from '../utils/try';

export class EntryParser {
    private _command: Command;
    private program: Program;

    constructor(command: Command, program: Program) {
        this._command = command;
        this.program = program;
    }

    public parse(args: string[]): ParsedEntry[] {
        const formattedEntries = this._format(args);
        const mergedEntries = this._merge(formattedEntries);

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

            if (
                entry.includes('=') &&
                (leadingDashesCount === 1 || leadingDashesCount === 2)
            ) {
                const option = trySync(() =>
                    parseInlineOption({
                        entry,
                        leadingDashes: leadingDashesCount,
                    })
                );
                if (option.success) {
                    return acc.concat(option.data);
                } else {
                    this.program._registerError(option.error);
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
                        value: '',
                        name: optionName,
                        variant: OptionVariant.Short,
                        fullName: entry,
                    });
                }

                const bunledOptions = parseBundledOptions({
                    entry: entry,
                    optionDefinitions: this._command.options,
                });

                return acc.concat(...bunledOptions);
            }

            if (leadingDashesCount === 2) {
                if (optionName.length > 1) {
                    acc.push({
                        type: EntryType.Option,
                        original: entry,
                        value: '',
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

        const mergedEntries: Array<ParsedEntry | null> = formattedEntries.map(
            (entry, index) => {
                if (!optionsStarted) {
                    // identify if positional arguments are over
                    optionsStarted = formattedEntries
                        .slice(0, index + 1)
                        .some((ent) => ent.type === EntryType.Option);
                }

                if (entry.type === EntryType.Argument && optionsStarted) {
                    // If entry is placed after the first option it is value of the option and should be merged to it. So skip this argument
                    return null;
                }

                if (entry.type === EntryType.Option) {
                    // Merge option with its value (space-separated value style)
                    const optionValue = this._getSpaceSeparatedOptionValue(
                        formattedEntries,
                        index
                    );
                    if (optionValue.length && entry.valueStyle) {
                        this.program._registerError(
                            new ArgzodError(ErrorCode.InvalidOption)
                        );

                        return null;
                    }

                    return {
                        ...entry,
                        value: entry.value === '' ? optionValue : entry.value,
                        valueStyle: optionValue.length
                            ? OptionValueStyle.SpaceSeparated
                            : entry.valueStyle,
                    };
                }

                return entry;
            },
            []
        );

        return mergedEntries.filter((ent) => ent != null);
    }

    private _getSpaceSeparatedOptionValue(
        entries: ParsedEntry[],
        optionIndex: number
    ): string | string[] {
        if (entries[optionIndex]?.type !== EntryType.Option) {
            this.program._registerError(new ArgzodError(ErrorCode.Internal));
            return '';
        }

        let shouldIterate = true;
        const values = entries
            .slice(optionIndex + 1)
            .reduce<string[]>((acc, entry) => {
                if (entry.type === EntryType.Option) {
                    shouldIterate = false;
                }
                if (!shouldIterate) return acc;

                return entry.type === EntryType.Argument
                    ? acc.concat(entry.value)
                    : acc;
            }, []);

        if (values.length === 0) return '';
        if (values.length === 1) return values[0]!;
        return values;
    }
}
