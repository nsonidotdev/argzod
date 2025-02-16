import { EntryType, OptionValueStyle, OptionVariant } from '../enums';
import type { ParsedOption } from '../types/arguments';
import type { CommandOptions } from '../types/command';
import { matchOptionDefinitionByOptionName } from '../utils/options';

// expects string like -abc or -abcvalue
export const parseBundledOptions = ({
    entry,
    optionDefinitions,
}: {
    entry: string;
    optionDefinitions: CommandOptions;
}): Array<ParsedOption> => {
    const name = entry.slice(1);
    const bundledOptions = name.split('');

    const firstUndefinedOptionIndex = bundledOptions.findIndex((optName) => {
        return !matchOptionDefinitionByOptionName(optName, optionDefinitions);
    });

    if (firstUndefinedOptionIndex > 0) {
        // first undefined option (value start index) should be at least second by its index so there is option name
        const optionsToBundle = bundledOptions.slice(0, firstUndefinedOptionIndex);
        const attachedValue = name.slice(firstUndefinedOptionIndex);

        return optionsToBundle.map((optName, index) => {
            const isLast = index === optionsToBundle.length - 1;

            return {
                fullName: '-' + optName,
                original: entry,
                name: optName,
                type: EntryType.Option,
                value: isLast ? [attachedValue] : [],
                variant: OptionVariant.Short,
                valueStyle: isLast ? OptionValueStyle.Attached : undefined,
                bunled: {
                    fullName: entry,
                    opts: optionsToBundle,
                },
            };
        });
    }

    return bundledOptions.map((opt) => {
        return {
            type: EntryType.Option,
            value: [],
            name: opt,
            variant: OptionVariant.Short,
            fullName: `-${opt}`,
            original: entry,
            bunled: {
                fullName: entry,
                opts: bundledOptions,
            },
        };
    });
};
