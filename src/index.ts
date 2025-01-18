import { Command, InferCommandArguments, InferCommandOptions, CommandArguments, CommandOptions, CommandName, ActionFn } from './types'
import { z } from 'zod';
import { syncHandleError } from './utils/handle-error';
import { getCommandData } from './utils';
import { ArgzodError } from './lib/error';


export const createProgram = <T extends string>() => {
    const commands: Command[] = [];

    return {
        run: (args: string[] = process.argv.slice(2)) => {
            const { data, error } = syncHandleError(() => getCommandData({ commandLine: args, commands }))

            if (error) {
                if (error instanceof ArgzodError) {
                    console.error(error.message);
                }

                if (error instanceof z.ZodError) {
                    console.error(error.issues
                        .map(i => {i.message})
                        .join("\n")
                    )
                }

                process.exit(1);
            }

            if (!data) {
                console.error("Something went wrong")
                process.exit(1)
            }

            data.command.run({
                commandArguments: data.parsedArguments,
                options: data.parsedOptions
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


const program = createProgram<"connect">();

program.command(undefined, {
    action: ({ commandArguments, options }) => {
        console.log('Performing index action')
        console.log(commandArguments, options)

    },
    commandArguments: [
    ],
    options: {}
})

program.command("connect", {
    action: ({ commandArguments, options }) => {
        console.log(`Connecting to the server... on port ${commandArguments[0]}`)
        console.log(options)
    },
    commandArguments: [
        { schema: z.coerce.number().min(1000)  },
    ],
    options: {
        col: {
            name: { long: "col", short: "c" },
            description: "",
            schema: z.coerce.number().min(0).max(100)
        }
    }
    // commandArguments: [
    //     { schema: z.any() },
    //     { schema: z.coerce.number().catch(0).transform(arg => arg + 10) },
    // ],
    // options: {
    //     filter: {
    //         schema: z.string()
    //             .refine(arg => {
    //                 const items = arg.split(',').map(item => item.trim());
    //                 console.log(items)
    //                 return items.length > 1;
    //             }, { message: "You should pass at least 2 arguments" })
    //             .transform(arg => arg.split(",").map(i => i.trim())),
    //         name: {
    //             long: "filetra",
    //             short: 'f'
    //         },
    //         description: "Does actualy nothing"
    //     },
    //     nvm: {
    //         schema: z.coerce.number().default(1),
    //         description: "Does actualy nothing"
    //     },
    //     force: {
    //         name: {
    //             long: "ajd",
    //             short: "a"
    //         }
    //     }
    // }
})

program.run(process.argv.slice(2));