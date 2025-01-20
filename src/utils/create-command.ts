import { ActionFn, Command, CommandArguments, CommandDefinition, CommandName, CommandOptions } from '../types/command'

export const createCommand = <
    const TArgs extends CommandArguments = CommandArguments,
    const TOpts extends CommandOptions = CommandOptions
>(
    options: CommandDefinition<string, TArgs, TOpts>,
): Command => {
    return {
        name: options.name,
        arguments: options.commandArguments ?? [],
        options: options.options ?? {},
        run: options.action as ActionFn,
    };
}
