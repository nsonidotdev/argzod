import type { z } from "zod";

export type CommandName<T extends string = "index"> = "index" | T;

export type ActionData<
    TArgs extends Array<any> = Array<any>,
    TOpts extends Record<string, any> = Record<string, any>
> = {
    options: TOpts;
    commandArguments: TArgs;
}

export type RunData = {
    parsedArguments: ParsedCommandString[];
}


export type Command = {
    name: string;
    run: (arg: RunData) => void;
}

export type OptionValue = string | true;

export type OptionVariant = "short" | "long";

export type ParsedOption = {
    type: "option";
    variant: OptionVariant;
    name: string;
    value: OptionValue;
}

export type ParsedArgument = {
    type: "argument";
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