import { parseArguments } from './utils/parse';
import { Command, CommandName, ExecutionData, ParsedOption } from './types'
import { z, ZodType } from 'zod';

type InferZodArray<TArgs extends Array<ZodType<any>>> = {
    [K in keyof TArgs]: z.infer<TArgs[K]>;
};

export const createProgram = <T extends string = "index">() => {
    const commands: Command<any>[] = [];

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
        command: <const TArgs extends Array<ZodType<any>>>(
            name: CommandName<T>,
            options: {
                action: (arg: ExecutionData<InferZodArray<TArgs>>) => void;
                commandArguments?: TArgs;
            },
        ) => {
            commands.push({
                name,
                run: (data) => {
                    const commandArguments = options.commandArguments?.map((schema, index) => {
                        return schema.parse(data.commandArguments[index])
                    }) as InferZodArray<TArgs> ?? [];

                    options.action({
                        ...data,
                        commandArguments,
                    });
                },
            } satisfies Command<InferZodArray<TArgs>>)
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
        console.log(commandArguments, options)
    },
    commandArguments: [
        z.any(),
        z.coerce.number().catch(0).transform(arg => arg + 10),
    ],
})

program.run(process.argv.slice(2));