import { ArgumentDefinition, Command, CommandName, ActionData, OptionDefinition, ParsedCommandString, ParsedOption } from './types'
import { z } from 'zod';
import { InferArgumentType, InferOptionType } from './types/utils';
import { ArgumentType } from './enums';
import { flagSchema } from './lib/schemas';
import { parseArguments } from './utils/cli';
import { getOptionValue } from './utils/options';

// TODO: Error handling
// TODO: Refactoring


export const createProgram = <T extends string = "index">() => {
    const commands: Command[] = [];

    return {
        run: (args: string[] = process.argv.slice(2)) => {
            const parsedArgs = parseArguments(args);
            console.log(parsedArgs)

            const commandName: string = parsedArgs[0]?.type === ArgumentType.Argument
                ? parsedArgs[0].value
                : 'index';

            const command = commands.find(c => c.name === commandName);
            if (!command) {
                console.log('Command not found.')
                return;
            }

            command.run({ parsedArguments: parsedArgs });
        },
        command: <
            const TArgs extends Array<ArgumentDefinition>,
            const TOpts extends Record<string, OptionDefinition>
        >(
            name: CommandName<T>,
            options: {
                action: (arg: ActionData<InferArgumentType<TArgs>, InferOptionType<TOpts>>) => void;
                commandArguments?: TArgs;
                options?: TOpts;
            },
        ) => {
            commands.push({
                name,
                run: (data) => {
                    const baseCommandArguments = data.parsedArguments
                        .filter(arg => arg.type === ArgumentType.Argument)


                    const commandArguments = options.commandArguments?.map((arg, index) => {
                        return arg.schema.parse(baseCommandArguments[index])
                    }) as InferArgumentType<TArgs> ?? [];

                    const parsedOptionsRecord = data.parsedArguments
                        .filter(arg => arg.type === ArgumentType.Option)
                        .reduce<Record<string, ParsedOption>>((acc, option) => {
                            return {
                                ...acc,
                                [option.name]: option
                            }
                        }, {})


                    const zodParsedOptions = options.options
                        ? Object.fromEntries(
                            Object.entries(options.options)
                                .map(([name, optDef]) => {
                                    const optionValue = getOptionValue(optDef.name ?? name, parsedOptionsRecord)

                                    return [name, (optDef.schema ?? flagSchema)?.parse(optionValue)]
                                })
                        ) as InferOptionType<TOpts>
                        : parsedOptionsRecord as InferOptionType<any>;;



                    options.action({
                        ...data,
                        commandArguments,
                        options: zodParsedOptions,
                    });
                },
            })
        },
    };
};


const program = createProgram<"connect">();

program.command("index", {
    action: ({ commandArguments, options }) => {
        console.log('Performing index action')
        console.log(commandArguments, options)
    },
})

program.command("connect", {
    action: ({ commandArguments, options }) => {
        console.log('Connecting to the server...')

        console.log("Filtered by", options.filter.join(', '))
        console.log("nvm", options.nvm)
        console.log("force", options.force)
    },
    commandArguments: [
        { schema: z.any() },
        { schema: z.coerce.number().catch(0).transform(arg => arg + 10) },
    ],
    options: {
        filter: {
            schema: z.string()
                .refine(arg => {
                    const items = arg.split(',').map(item => item.trim());
                    console.log(items)
                    return items.length > 1;
                }, { message: "You should pass at least 2 arguments" })
                .transform(arg => arg.split(",").map(i => i.trim())),
            name: {
                long: "filetra",
                short: 'f'
            },
            description: "Does actualy nothing"
        },
        nvm: {
            schema: z.coerce.number().default(1),
            description: "Does actualy nothing"
        },
        force: {
            name: {
                long: "ajd",
                short: "a"
            }
        }
    }
})

program.run(process.argv.slice(2));