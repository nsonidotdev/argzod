import { ArgumentDefinition, Command, CommandName, ActionData, OptionDefinition, ParsedOption, InferCommandArguments, InferCommandOptions, CommandArguments, CommandOptions } from './types'
import { ArgumentType } from './enums';
import { flagSchema } from './lib/schemas';
import { argumentParser } from './utils/argument-parser';
import { getOptionValue } from './utils/options';


export const createProgram = <T extends string = "index">() => {
    const commands: Command[] = [];

    return {
        run: (args: string[] = process.argv.slice(2)) => {
            const parsedArgs = argumentParser.parse(args);

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
            const TArgs extends CommandArguments,
            const TOpts extends CommandOptions
        >(
            name: CommandName<T>,
            options: {
                action: (arg: ActionData<InferCommandArguments<TArgs>, InferCommandOptions<TOpts>>) => void;
                commandArguments?: TArgs;
                options?: TOpts;
            },
        ) => {
            commands.push({
                name,
                arguments: options.commandArguments ?? [],
                options: options.options ?? {},
                run: (data) => {
                    const baseCommandArguments = data.parsedArguments
                        .filter(arg => arg.type === ArgumentType.Argument)


                    const commandArguments = options.commandArguments?.map((arg, index) => {
                        return arg.schema.parse(baseCommandArguments[index])
                    }) as InferCommandArguments<TArgs> ?? [];

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
                        ) as InferCommandOptions<TOpts>
                        : parsedOptionsRecord as InferCommandOptions<any>;;



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


    },
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