import type { ObjectValues } from './types/utils';

export const OptionVariant = {
    Long: 'long',
    Short: 'short',
} as const;
export type OptionVariant = ObjectValues<typeof OptionVariant>;

export const ArgumentType = {
    Argument: 'argument',
    Option: 'option',
} as const;
export type ArgumentType = ObjectValues<typeof ArgumentType>;

export const OptionValueStyle = {
    Inline: 'inline', // --option=value
    SpaceSeparated: 'space', // --option value
} as const;
export type OptionValueStyle = ObjectValues<typeof OptionValueStyle>;
