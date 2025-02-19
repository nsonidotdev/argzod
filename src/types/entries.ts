import type { z } from 'zod';
import type { EntryType, OptionParseType, OptionValueStyle, OptionVariant } from '../enums';
import type { OptionDef } from './option-def';
import type { ObjectValues } from './utils';

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

export type OptionParsedReturnType = {
    [OptionParseType.Boolean]: boolean;
    [OptionParseType.Single]: string | undefined;
    [OptionParseType.Many]: string[];
};


export type OptionValidationInput<T extends keyof OptionParsedReturnType | undefined = undefined> = T extends string ? OptionParsedReturnType[T] : ObjectValues<OptionParsedReturnType>;

export type ValidatedOption = { value: OptionValidationInput, options: ParsedOption[], definition: OptionDef }


export type ParsedPositionalArgument = {
    type: (typeof EntryType)['Argument'];
    value: string;
};

export type ParsedEntry = ParsedOption | ParsedPositionalArgument;

export type ArgumentDefinition = {
    description?: string;
    schema: z.ZodType<any>;
};
