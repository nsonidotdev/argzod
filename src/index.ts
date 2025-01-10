import { parseArguments } from './utils/parse';
import { Command, CommandName, ExecutionData, ParsedOption } from './types'

export const createProgram = <T extends string = "index">() => {
    const commands: Command[] = [];

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

            const options = parsedArgs
                .filter(arg => arg.type === 'option')
                .reduce<ExecutionData['options']>((acc, option) => {
                    return {
                        ...acc,
                        [option.name]: option
                    }
                }, {});

            command.run({
                args: parsedArgs.filter(arg => arg.type === 'argument'),
                options,
            });
        },
        command: (
            name: CommandName<T>,
            options: {
                action: (arg: ExecutionData) => void;
            }
        ) => {
            commands.push({
                name,
                run: (data: ExecutionData) => {
                    console.log(`Running "${name}" command...`)
                    options.action(data);
                },
            })
        },
    };
};


const program = createProgram<"connect">();

program.command("index", {
    action: ({ args, options }) => {
        console.log('Performing index action')
        console.log(args, options)

    }
})

program.command("connect", {
    action: ({ args, options }) => {
        console.log('Connecting to the server...')
        console.log(args, options)
    }
})

program.run(process.argv.slice(2));