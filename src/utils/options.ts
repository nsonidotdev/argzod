import type { ParsedOption } from '../types/entries';
import type { CommandOptions } from '../types/command';
import type { OptionDef } from '../types/option-def';

export const matchOptionDefinitionByOptionName = <T extends string>(
    option: string,
    definitions: CommandOptions
): [T, OptionDef] | undefined => {
    return Object.entries<OptionDef>(definitions).find(([, definition]) => {
        if (typeof definition.name === 'string') {
            return definition.name === option;
        } else {
            return definition.name.some((name) => name === option);
        }
    }) as [T, OptionDef] | undefined;
};

export const matchParsedOptionsByDefinition = (
    definition: OptionDef,
    parsedOptions: ParsedOption[] 
): (ParsedOption & { index: number })[] => {
    const definitionNames: string[] = [];

    if (typeof definition.name === 'string') {
        definitionNames.push(definition.name);
    } else {
        definitionNames.push(...definition.name);
    }

    return parsedOptions.reduce<(ParsedOption & { index: number })[]>((acc, opt, index) => {
        const isMatching = definitionNames.some((name) => name === opt.name);
        if (!isMatching) return acc;
        const withIndex = {
            ...opt,
            index
        }

        return [...acc, withIndex];
    }, []);
};

export const stringifyOptionDefintion = (defintion: OptionDef): string => {
    const isLong = (option: string) => option.length > 1;

    if (typeof defintion.name === 'string') {
        return isLong(defintion.name) ? '--' + defintion.name : '-' + defintion.name;
    } else {
        const name = defintion.name[0]!;
        return isLong(name) ? '--' + name : '-' + name;
    }
};

export const stringifyOptionName = (name: string): string => {
    if (name.length > 1) {
        return '--' + name;
    } else {
        return '-' + name;
    }
};

export const getOptionNames = (opt: OptionDef) => {
    if (opt.name instanceof Array) {
        return opt.name.map((optName) => stringifyOptionName(optName)).join(', ');
    } else {
        return stringifyOptionName(opt.name);
    }
};

