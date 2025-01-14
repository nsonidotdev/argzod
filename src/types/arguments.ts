import type { z } from "zod";
import type { ArgumentType, OptionVariant } from "../enums";

export type OptionValue = string | true | string[];

export type ParsedOption = {
    type: (typeof ArgumentType)['Option'];
    variant: OptionVariant;
    name: string;
    value: OptionValue;
}

export type ParsedArgument = {
    type: (typeof ArgumentType)['Argument'];
    value: string;
}

export type ParsedCommandString =
    | ParsedOption
    | ParsedArgument


export type OptionDefinition = {
    description?: string;
    schema?: z.ZodType<any>;
    name?: Partial<Record<OptionVariant, string>> | string;
}

export type ArgumentDefinition = {
    description?: string;
    schema: z.ZodType<any>;
}