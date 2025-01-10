import { ParseOptions } from "querystring";

export type CommandName<T extends string = "index"> = "index"  | T;

export type ExecutionData = {
    options: Record<string, ParsedOption>;
    args: Array<ParsedArgument>;
}

export type Command = {
    name: string;
    run: (arg: ExecutionData) => void;
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