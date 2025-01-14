import { ParsedCommandString } from "./arguments";

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