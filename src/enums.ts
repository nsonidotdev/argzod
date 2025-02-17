import type { ObjectValues } from './types/utils';

export const OptionVariant = {
    Long: 'long',
    Short: 'short',
} as const;
export type OptionVariant = ObjectValues<typeof OptionVariant>;

export const EntryType = {
    Argument: 'argument',
    Option: 'option',
} as const;
export type EntryType = ObjectValues<typeof EntryType>;

export const OptionValueStyle = {
    Inline: 'inline', // --option=value
    SpaceSeparated: 'space', // --option value
    Attached: 'attached', // -ovalue
} as const;
export type OptionValueStyle = ObjectValues<typeof OptionValueStyle>;

export const ErrorLevel = {
    Error: 'error',
    Warn: 'warn',
    Ignore: 'ignore',
} as const;
export type ErrorLevel = ObjectValues<typeof ErrorLevel>;

export const OptionParseType = {
    Boolean: 'boolean',
    Single: 'single',
    Many: 'many'
} as const;
export type OptionParseType = ObjectValues<typeof OptionParseType>