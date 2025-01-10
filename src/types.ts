import { ParseOptions } from "querystring";

export type CommandName<T extends string = "index"> = "index" | T;

export type ExecutionData<
    TArgs extends Array<any> = Array<any>,
    TOpts extends Record<string, any> = Record<string, any>
> = {
    options: TOpts;
    commandArguments: TArgs;
}

export type Command<
    TArgs extends Array<any> = Array<any>,
    TOpts extends Record<string, any> = Record<string, any>
> = {
    name: string;
    run: (arg: ExecutionData<TArgs, TOpts>) => void;
}

export type OptionValue = string | true;

export type ParsedOption = {
    type: "option";
    variant: "long" | "short";
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