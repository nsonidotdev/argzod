import { ParseOptions } from "querystring";

export type CommandName<T extends string = "index"> = "index"  | T;

export type ExecutionData<TArgs extends Array<any> = Array<any>> = {
    options: Record<string, OptionValue>;
    commandArguments: TArgs;
}

export type Command<TArgs extends Array<any> = Array<any>> = {
    name: string;
    run: (arg: ExecutionData<TArgs>) => void;
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