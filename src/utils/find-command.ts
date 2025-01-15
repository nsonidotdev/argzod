import { isOptionValid } from ".";
import { Command, CommandArguments } from "../types";


export const matchCommand = (argv: string[], commands: Command[]): Command | undefined => {
    let argumentsEnd = false
    const args = argv.reduce<string[]>((acc, arg) => {
        const isValidOption = isOptionValid(arg);
        if (isValidOption === true && !argumentsEnd) {
            argumentsEnd = isValidOption
        };

        if (argumentsEnd) return acc;
        return acc.concat(arg);
    }, []);

    const indexCommand = commands.find(c => c.name === undefined);
    const targetCommandName = args[0];
    const targetCommand = commands.find(c => c.name === targetCommandName);

    if (targetCommand) {
        const matched = areArgumentsMatching(args.slice(1), targetCommand.arguments);
        if (matched) return targetCommand;
    }

    if (indexCommand) {
        const matched = areArgumentsMatching(args, indexCommand.arguments);
        if (matched) return indexCommand;
    };
}

const areArgumentsMatching = (args: string[], commandArguments: CommandArguments): boolean => {    
    if (args.length > commandArguments.length) return false;
    
    return commandArguments.every((commandArgument, index) => {
        try {
            const argument = args[index];
            commandArgument.schema.parse(argument)

            return true;
        } catch {
            return false
        }
    })
}