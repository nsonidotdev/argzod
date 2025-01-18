import type { z } from "zod";
import type { ArgumentType, OptionVariant } from "../enums";


export type FormattedOption = {
    type: (typeof ArgumentType)['Option'];
    variant: OptionVariant;
    name: string;
    value: string;
    fullName: string;
}

export type FormattedArgument = {
    type: (typeof ArgumentType)['Argument'];
    value: string;
}

export type FormattedCommandString =
    | FormattedOption
    | FormattedArgument


export type OptionDefinition = {
    description?: string;
    schema?: z.ZodType<any>;
    name?: Partial<Record<OptionVariant, string>> | string;
}

export type ArgumentDefinition = {
    description?: string;
    schema: z.ZodType<any>;
}