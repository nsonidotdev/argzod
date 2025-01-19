import { Command, CommandArguments, CommandOptions, CommandName, ActionFn } from '../types/command'
import { InferCommandArguments, InferCommandOptions } from '../types/utils';
import { z } from 'zod';
import { trySync } from '../utils/try';
import { getCommandData } from '../utils';
import { ArgzodError } from '../errors';


export const createProgram = <T extends string>() => {
    const commands: Command[] = [];

    return {
        run: (args: string[] = process.argv.slice(2)) => {
            const commandResult = trySync(() => getCommandData({ commandLine: args, commands }))

            if (!commandResult.success) {
                if (commandResult.error instanceof ArgzodError) {
                    console.error(commandResult.error.message);
                }

                if (commandResult.error instanceof z.ZodError) {
                    console.error(commandResult.error.issues
                        .map(i => {i.message})
                        .join("\n")
                    )
                }

                process.exit(1);
            }

            commandResult.data.command.run({
                commandArguments: commandResult.data.parsedArguments,
                options: commandResult.data.parsedOptions
            });

        },

        // Here we only need to make types for arguments of command function and we don't care about type in commands array
        command: <
            const TArgs extends CommandArguments,
            const TOpts extends CommandOptions
        >(
            name: CommandName<T>,
            options: {
                action: ActionFn<InferCommandArguments<TArgs>, InferCommandOptions<TOpts>>;
                commandArguments?: TArgs;
                options?: TOpts;
            },
        ) => {
            const command: Command = {
                name,
                arguments: options.commandArguments ?? [],
                options: options.options ?? {},
                run: options.action as ActionFn
            };

            commands.push(command);
        },
    };
};
