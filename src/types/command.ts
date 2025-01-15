import type { ArgumentDefinition, OptionDefinition, ParsedCommandString } from "./arguments";

export type CommandName<T extends string = "index"> = undefined | T;

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

export type CommandOptions = Record<string, OptionDefinition>;
export type CommandArguments = Array<ArgumentDefinition>;

export type Command = {
    name: CommandName<string>;
    run: (arg: RunData) => void;
    options: CommandOptions;
    arguments: CommandArguments;
}