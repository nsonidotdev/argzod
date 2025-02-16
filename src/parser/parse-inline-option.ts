import { EntryType, OptionValueStyle, OptionVariant } from '../enums';
import { ArgzodError, ErrorCode } from '../errors';
import { isValidOptionName } from '../utils';
import type { ParsedOption } from '../types/arguments';

export const parseInlineOption = ({ leadingDashes, entry }: { entry: string; leadingDashes: number }): ParsedOption => {
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
