import type { ArgumentDefinition, ParsedEntry } from './arguments';
import type { OptionDef } from './option-def';
import type { InferCommandArguments, InferCommandOptions } from './utils';

export type CommandName<T extends string = string> = undefined | T;

export type ActionFn<TArgs extends Array<any> = Array<any>, TOpts extends Record<string, any> = Record<string, any>> = (
    actionData: ActionData<TArgs, TOpts>
) => void;

export type ActionData<
    TArgs extends Array<any> = Array<any>,
    TOpts extends Record<string, any> = Record<string, any>,
> = {
    options: TOpts;
    args: TArgs;
    parsedCommandLine: ParsedEntry[];
};

export type CommandOptions = Record<string, OptionDef> & Partial<{ help: OptionDef }>;
export type CommandArguments = Array<ArgumentDefinition>;

export type CommandDefinition<
    TName extends CommandName = CommandName<string>,
    TArgs extends CommandArguments = never[],
    TOpts extends CommandOptions = Record<string, never>,
> = {
    name?: TName;
    description?: string;
    args?: TArgs;
    options?: TOpts;
    action: ActionFn<InferCommandArguments<TArgs>, InferCommandOptions<TOpts>>;
};
