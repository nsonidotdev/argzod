import type { ParsedOption } from '../types/arguments';
import type { CommandOptions } from '../types/command';
import type { OptionDef } from '../types/option-def';

export const matchOptionDefinitionByOptionName = <T extends string>(
    option: string,
    definitions: CommandOptions
): [T, OptionDef] | undefined => {
    return Object.entries<OptionDef>(definitions).find(([key, definition]) => {
        if (typeof definition.name === 'undefined') {
            return key === option;
        } else if (typeof definition.name === 'string') {
            return definition.name === option;
        } else {
            return definition.name.some((name) => name === option);
        }
    }) as [T, OptionDef] | undefined;
};

export const matchParsedOptionsByDefinition = (
    [defKey, definition]: [string, OptionDef],
    parsedOptions: ParsedOption[]
): ParsedOption[] => {
    const definitionNames: string[] = [];

    if (typeof definition.name === 'undefined') {
        definitionNames.push(defKey);
    } else if (typeof definition.name === 'string') {
        definitionNames.push(definition.name);
    } else {
        definitionNames.push(...definition.name);
    }

    return parsedOptions.filter((opt) => {
        return definitionNames.some((name) => name === opt.name);
    });
};

export const stringifyOptionDefintion = ([key, defintion]: [string, OptionDef]): string => {
    const isLong = (option: string) => option.length > 1;

    if (typeof defintion.name === 'string') {
        return isLong(defintion.name) ? '--' + defintion.name : '-' + defintion.name;
    } else if (defintion.name instanceof Array && defintion.name.length > 0) {
        const name = defintion.name[0]!;
        return isLong(name) ? '--' + name : '-' + name;
    } else {
        return isLong(key) ? '--' + key : '-' + key;
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
