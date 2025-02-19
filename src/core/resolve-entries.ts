import type { Command } from "../api/command";
import { EntryType, OptionValueStyle } from "../enums";
import type { ParsedEntry, ParsedOption, ParsedPositionalArgument } from "../types/entries";
import { operation } from "../utils/operation";
import { matchOptionDefinitionByOptionName } from "../utils/options";



export const resolveEntries = operation((ctx, command: Command, entries: ParsedEntry[]): ParsedEntry[] => {
    let isOptionMet = false;

    const resolvedEntries = entries.reduce<Array<ParsedEntry>>((acc, entry, index, arr) => {
        if (entry.type === EntryType.Argument) {
            // If option is met then argument may be value of the option 
            // This scenario is handled further
            if (isOptionMet) return acc;

            return [...acc, entry]
        };

        isOptionMet = true;

        const defResult = matchOptionDefinitionByOptionName(entry.name, command.options);
        const nextValues = getFollowedArgs(arr.slice(index + 1));
        const maxValues = defResult ? {
            boolean: 0,
            single: 1,
            many: defResult[1].parse === 'many' ? defResult[1].maxValues : undefined
        }[defResult[1].parse] : undefined;

        const { values, args } = splitValuesAndArgs(entry, nextValues, maxValues);
        entry.value = [...entry.value, ...values];
        return [...acc, entry, ...args];
    }, []);


    return resolvedEntries;
})

const splitValuesAndArgs = (option: ParsedOption, args: ParsedPositionalArgument[], maxArgs?: number): { values: string[], args: ParsedPositionalArgument[] } => {
    if (option.valueStyle && option.valueStyle !== OptionValueStyle.SpaceSeparated) {
        return { values: [], args }
    }

    if (typeof maxArgs !== 'number') {
        return {
            values: args.map(a => a.value),
            args: [],
        }
    }
    return {
        values: args.slice(0, maxArgs).map(e => e.value),
        args: args.slice(maxArgs)
    }
}


const getFollowedArgs = (followedEntries: ParsedEntry[]): ParsedPositionalArgument[] => {
    let args: ParsedPositionalArgument[] = [];

    for (let entry of followedEntries) {
        if (entry.type === EntryType.Option) break;
        args.push(entry);
    }

    return args;
}