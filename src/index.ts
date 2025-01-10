import { parseArguments } from './utils/parse';
import { Command, CommandName } from './types'

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
            
            command.run();
        },
        command: (
            name: CommandName<T>, 
            options: {
                action: () => void;
            }
        ) => {
            commands.push({
                name,
                run: () => {
                    console.log(`Running "${name}" command...`)
                    options.action();
                },
            })
        },
    };
};


const program = createProgram<"connect">();

program.command("index", {
    action: () => {
        console.log('Performing index action')
    }
})

program.command("connect", {
    action: () => {
        console.log('Connecting to the server...')
    }
})

program.run(process.argv.slice(2));