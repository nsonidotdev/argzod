import type { ObjectValues } from '../types/utils';

export const ErrorCode = {
    Other: 'other',
    ZodParse: 'zod-parse',
    InvalidOptionName: 'invalid-option-name',
    InvalidShortOptionFormat: 'invalid-short-option',
    InvalidLongOptionFormat: 'invalid-long-option',
    InvalidInlineOptionFormat: 'invalid-inline-long-option',
    ShortInlineOptionsNotSupported: 'short-inline-options-not-supported',
    InvalidOptionFormat: 'invalid-option',
    CanNotCombineOptValueStyles: 'can-not-combine-opt-val-styles',
    OptionNotDefined: 'option-not-defined',
    CommandNotFound: 'command-not-found',
    CommandDuplication: 'command-duplication',
} as const;
export type ErrorCode = ObjectValues<typeof ErrorCode>;
