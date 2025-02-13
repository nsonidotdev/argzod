import type { z } from 'zod';
import type { EntryType, OptionValueStyle, OptionVariant } from '../enums';

export type ParsedOption = {
    type: (typeof EntryType)['Option'];
    variant: OptionVariant;
    name: string;
    value: string[];
    fullName: string;
    valueStyle?: OptionValueStyle;
    original: string;
    bunled?: {
        fullName: string;
        opts: string[];
    };
};

export type ParsedPositionalArgument = {
    type: (typeof EntryType)['Argument'];
    value: string;
};

export type ParsedEntry = ParsedOption | ParsedPositionalArgument;

export type ArgumentDefinition = {
    description?: string;
    schema: z.ZodType<any>;
};
