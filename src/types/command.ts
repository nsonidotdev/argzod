import type {
    ArgumentDefinition,
    OptionDefinition,
    ParsedEntry,
} from './arguments';
import type { InferCommandArguments, InferCommandOptions } from './utils';

export type CommandName<T extends string = string> = undefined | T;

export type ActionFn<
    TArgs extends Array<any> = Array<any>,
    TOpts extends Record<string, any> = Record<string, any>,
> = (actionData: ActionData<TArgs, TOpts>) => void;

export type ActionData<
    TArgs extends Array<any> = Array<any>,
    TOpts extends Record<string, any> = Record<string, any>,
> = {
    options: TOpts;
    args: TArgs;
    parsedCommandLine: ParsedEntry[];
};

export type CommandOptions = Record<string, OptionDefinition>;
export type CommandArguments = Array<ArgumentDefinition>;

export type Command<
    TArgs extends CommandArguments = CommandArguments,
    TOpts extends CommandOptions = CommandOptions,
> = {
    name: CommandName<string>;
    action: (
        arg: ActionData<
            InferCommandArguments<TArgs>,
            InferCommandOptions<TOpts>
        >
    ) => void;
    options: TOpts;
    arguments: TArgs;
};

export type CommandDefinition<
    TName extends CommandName = CommandName<string>,
    TArgs extends CommandArguments = never[],
    TOpts extends CommandOptions = Record<string, never>,
> = {
    name?: TName;
    args?: TArgs;
    options?: TOpts;
    action: ActionFn<InferCommandArguments<TArgs>, InferCommandOptions<TOpts>>;
};
