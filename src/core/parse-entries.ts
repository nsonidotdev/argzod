import type { Command } from "../api/command"
import type { ParsedEntry } from "../types/entries"
import { EntryType, OptionParseType, OptionValueStyle, OptionVariant } from '../enums';
import type { ParsedOption } from '../types/entries';
import type { CommandOptions } from '../types/command';
import { matchOptionDefinitionByOptionName } from '../utils/options';
import { ArgzodError, ErrorCode } from '../errors';
import { countLeadingDashes, isNumericString, isValidOptionName } from '../utils';
import { trySync } from "../utils/try";
import { operation } from "../utils/operation";

export const parseEntries = operation((ctx, command: Command, entries: string[]): ParsedEntry[] => {
    const parsedEntries = entries.reduce<ParsedEntry[]>((acc, entry) => {
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
            const inlineOptResult = trySync(() =>
                parseInlineOptionEntry({
                    entry,
                    leadingDashes: leadingDashesCount,
                })
            );


            if (inlineOptResult.success) {
                return acc.concat(inlineOptResult.data);
            } else {
                ctx.errors.add(inlineOptResult.error);
                return acc;
            }
        }

        const optionName = entry.slice(leadingDashesCount);
        if (!isValidOptionName(optionName)) {
            ctx.errors.add(new ArgzodError({
                code: ErrorCode.InvalidOption,
            }));

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

            const bunledOptions = parseBundledOptionsEntry({
                entry: entry,
                optionDefinitions: command.options,
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
                ctx.errors.add(
                    new ArgzodError({
                        code: ErrorCode.InvalidOption,
                        path: entry,
                    })
                )

                return acc;
            }
        }

        ctx.errors.add(
            new ArgzodError({
                code: ErrorCode.InvalidOption,
                path: entry,
            })
        )

        return acc;
    }, []);

    return parsedEntries;
})

const parseInlineOptionEntry = ({ leadingDashes, entry }: { entry: string; leadingDashes: number }): ParsedOption => {
    const inlineOptionArray = entry.slice(leadingDashes).split('=');
    if (leadingDashes === 1 || (inlineOptionArray[0]?.length ?? 0) < 2) {
        throw new ArgzodError({
            code: ErrorCode.InvalidOption,
        });
    }

    if (inlineOptionArray.length !== 2) {
        throw new ArgzodError({
            code: ErrorCode.InvalidOption,
        });
    }

    const [optName, optValue] = inlineOptionArray as [string, string];
    if (!isValidOptionName(optName)) {
        throw new ArgzodError({
            code: ErrorCode.InvalidOption,
        });
    }

    return {
        type: EntryType.Option,
        value: [optValue],
        name: optName,
        variant: OptionVariant.Short,
        fullName: `--${optName}`,
        valueStyle: OptionValueStyle.Inline,
        original: entry,
    };
};

// expects string like -abc or -abcvalue
const parseBundledOptionsEntry = ({
    entry,
    optionDefinitions,
}: {
    entry: string;
    optionDefinitions: CommandOptions;
}): Array<ParsedOption> => {
    const name = entry.slice(1);
    const bundledOptions = name.split('');

    const valuesMap: Map<string, string | undefined> = new Map();

    for (let [index, opt] of bundledOptions.entries()) {
        if (!isValidOptionName(opt)) continue;
        if (valuesMap.has(opt)) {
            // Duplicate option
            throw new ArgzodError({
                code: ErrorCode.InvalidOption,
            });
        };

        const matched = matchOptionDefinitionByOptionName(opt, optionDefinitions);
        if (!matched || (matched[1].parse === OptionParseType.Boolean)) {
            const filteredValues = bundledOptions
                .slice(index + 1)
                .filter(o => !isValidOptionName(o));

            const value = filteredValues.length ? filteredValues.join('') : undefined
            valuesMap.set(opt, value);
            continue;
        }

        const value = bundledOptions.slice(index + 1).join('');
        valuesMap.set(opt, value);
        break;
    }

    const optionNames = Array.from(valuesMap.keys());
    const parsedBundledOptions = Array.from(valuesMap.entries(), ([optName, value]) => {
        const hasValue = typeof value === 'string';
        return {
            fullName: '-' + optName,
            name: optName,
            original: entry,
            type: EntryType.Option,
            value: hasValue ? [value] : [],
            variant: OptionVariant.Short,
            valueStyle: hasValue ? OptionValueStyle.Attached : undefined,
            bunled: {
                fullName: entry,
                opts: optionNames
            }
        } satisfies ParsedOption
    })

    return parsedBundledOptions
};
