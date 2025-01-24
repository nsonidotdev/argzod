import type { z } from 'zod';
import type { ArgumentType, OptionValueStyle, OptionVariant } from '../enums';

export type ParsedOption = {
    type: (typeof ArgumentType)['Option'];
    variant: OptionVariant;
    name: string;
    value: string | string[];
    fullName: string;
    valueStyle?: OptionValueStyle;
    bunled?: {
        fullName: string;
        opts: string[];
    };
};

export type ParsedPositionalArgument = {
    type: (typeof ArgumentType)['Argument'];
    value: string;
};

export type ParsedArgument = ParsedOption | ParsedPositionalArgument;

export type OptionDefinition = {
    description?: string;
    schema?: z.ZodType<any>;
    name?: Partial<Record<OptionVariant, string>> | string;
};

export type ArgumentDefinition = {
    description?: string;
    schema: z.ZodType<any>;
};
