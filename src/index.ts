import { parseArguments } from './utils/parse';
import { Command, CommandName, ExecutionData, ParsedOption } from './types'
import { z, ZodType } from 'zod';

type InferZodArray<TArgs extends Array<ZodType<any>>> = {
    [K in keyof TArgs]: z.infer<TArgs[K]>;
};

type InferZodRecord<TOpts extends Record<string, ZodType<any>>> = {
    [K in keyof TOpts]: z.infer<TOpts[K]>;
};

export const createProgram = <T extends string = "index">() => {
    const commands: Command<any, any>[] = [];

    return {
        run: (args: string[] = process.argv.slice(2)) => {
            const parsedArgs = parseArguments(args);

            const commandName: CommandName<string> = parsedArgs[0]?.type === 'argument'
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
            const TArgs extends Array<ZodType<any>>,
            const TOpts extends Record<string, ZodType<any>>
        >(
            name: CommandName<T>,
            options: {
                action: (arg: ExecutionData<InferZodArray<TArgs>, InferZodRecord<TOpts>>) => void;
                commandArguments?: TArgs;
                options?: TOpts;
            },
        ) => {
            commands.push({
                name,
                run: (data) => {
                    const commandArguments = options.commandArguments?.map((schema, index) => {
                        return schema.parse(data.commandArguments[index])
                    }) as InferZodArray<TArgs> ?? [];

                    const zodParsedOptions = options.options
                        ? Object.fromEntries(
                            Object.entries(options.options)
                                .map(([name, schema]) => {
                                    const value = data.options[name];

                                    return [name, schema.parse(value)]
                                })
                        ) as InferZodRecord<TOpts>
                        : data.options;

                    options.action({
                        ...data,
                        commandArguments,
                        options: zodParsedOptions,
                    });
                },
            } satisfies Command<InferZodArray<TArgs>, InferZodRecord<TOpts>>)
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
        z.any(),
        z.coerce.number().catch(0),
        z.coerce.date(),
    ],
})

program.command("connect", {
    action: ({ commandArguments, options }) => {
        console.log('Connecting to the server...')

        console.log("Filtered by", options.filter.join(', '))
    },
    commandArguments: [
        z.any(),
        z.coerce.number().catch(0).transform(arg => arg + 10),
    ],
    options: {
        filter: z.string()
            .refine(arg => {
                const items = arg.split(',').map(item => item.trim());
                console.log(items)
                return items.length > 1;
            }, { message: "You should pass at least 2 arguments" })
            .transform(arg => arg.split(",").map(i => i.trim()))
    }
})

program.run(process.argv.slice(2));