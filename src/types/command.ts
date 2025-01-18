import type { ArgumentDefinition, OptionDefinition, FormattedCommandString } from "./arguments";
import { InferCommandArguments, InferCommandOptions } from "./utils";

export type CommandName<T extends string = "index"> = undefined | T;


export type ActionFn<
    TArgs extends Array<any> = Array<any>,
    TOpts extends Record<string, any> = Record<string, any>
> = (actionData: ActionData<TArgs, TOpts>) => void;

export type ActionData<
    TArgs extends Array<any> = Array<any>,
    TOpts extends Record<string, any> = Record<string, any>
> = {
    options: TOpts;
    commandArguments: TArgs;
}


export type CommandOptions = Record<string, OptionDefinition>;
export type CommandArguments = Array<ArgumentDefinition>;

export type Command<TArgs extends CommandArguments = CommandArguments, TOpts extends CommandOptions = CommandOptions> = {
    name: CommandName<string>;
    run: (arg: ActionData<InferCommandArguments<TArgs>, InferCommandOptions<TOpts>>) => void;
    options: TOpts;
    arguments: TArgs;
}