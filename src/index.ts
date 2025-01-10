import { parseArguments } from './utils/parse';
import { ArgumentDefinition, Command, CommandName, ExecutionData, OptionDefinition } from './types'
import { z, ZodType } from 'zod';
import { InferArgumentType, InferOptionType } from './types/utils';


export const createProgram = <T extends string = "index">() => {
    const commands: Command<any, any>[] = [];

    return {
        run: (args: string[] = process.argv.slice(2)) => {
            const parsedArgs = parseArguments(args);

            const commandName: string = parsedArgs[0]?.type === 'argument'
                ? parsedArgs[0].value
                : 'index';

            const command = commands.find(c => c.name === commandName);
            if (!command) {
                console.log('Command not found.')
                return;
            }

            const options: ExecutionData['options'] = parsedArgs
                .filter(arg => arg.type === 'option')
                .reduce((acc, option) => {
                    return {
                        ...acc,
                        [option.name]: option.value
                    }
                }, {});

            const commandArguments = parsedArgs
                .filter(arg => arg.type === 'argument')
                .map(arg => arg.value);


            command.run({
                commandArguments,
                options,
            });
        },
        command: <
            const TArgs extends Array<ArgumentDefinition>,
            const TOpts extends Record<string, OptionDefinition>
        >(
            name: CommandName<T>,
            options: {
                action: (arg: ExecutionData<InferArgumentType<TArgs>, InferOptionType<TOpts>>) => void;
                commandArguments?: TArgs;
                options?: TOpts;
            },
        ) => {
            commands.push({
                name,
                run: (data) => {
                    const commandArguments = options.commandArguments?.map((arg, index) => {
                        return arg.schema.parse(data.commandArguments[index])
                    }) as InferArgumentType<TArgs> ?? [];

                    const zodParsedOptions = options.options
                        ? Object.fromEntries(
                            Object.entries(options.options)
                                .map(([name, { schema }]) => {
                                    const fallbackSchema = z.any()
                                        .refine(() => {
                                            return name in data.options;
                                        }, { message: "This flag is required" })
                                        .refine(arg => {
                                            return arg === true;
                                        }, { message: "Option is a flag and can't have any values" });

                                    const value = data.options[name];
                                    return [name, (schema ?? fallbackSchema)?.parse(value)]
                                })
                        ) as InferOptionType<TOpts>
                        : data.options;

                    options.action({
                        ...data,
                        commandArguments,
                        options: zodParsedOptions,
                    });
                },
            } satisfies Command<InferArgumentType<TArgs>, InferOptionType<TOpts>>)
        },
    };
};


const program = createProgram<"connect">();

program.command("index", {
    action: ({ commandArguments, options }) => {
        const num = commandArguments[2];

        console.log('Performing index action')
        console.log(commandArguments, options)
    },
    commandArguments: [
        { schema: z.any() },
        { schema: z.coerce.number().catch(0) },
        { schema: z.coerce.date() },
    ],
})

program.command("connect", {
    action: ({ commandArguments, options }) => {
        console.log('Connecting to the server...')

        console.log("Filtered by", options.filter.join(', '))
        console.log("Flag arg", options.down)
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
                long: "filter",
                short: 'f'
            },
            description: "Does actualy nothing"
        },
        down: {}
    }
})

program.run(process.argv.slice(2));