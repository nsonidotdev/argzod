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
    action: ({ commandArguments, options }) => {
        console.log('Performing index action')
        console.log(commandArguments, options)

    }
})

program.command("connect", {
    action: ({ commandArguments, options }) => {
        console.log('Connecting to the server...')
        console.log(commandArguments, options)
    }
})

program.run(process.argv.slice(2));