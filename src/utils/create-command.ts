import type {
    ActionFn,
    Command,
    CommandArguments,
    CommandDefinition,
    CommandOptions,
} from '../types/command';

export const createCommand = <
    const TArgs extends CommandArguments = CommandArguments,
    const TOpts extends CommandOptions = CommandOptions,
>(
    options: CommandDefinition<string, TArgs, TOpts>
): Command => {
    return {
        name: options.name,
        arguments: options.args ?? [],
        options: options.options ?? {},
        action: options.action as ActionFn,
    };
};
