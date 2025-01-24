import { ParsedOption, OptionDefinition } from '../types/arguments';
import { CommandOptions } from '../types/command';

export const matchOptionDefinitionByParsedOption = <T extends string>(
    option: ParsedOption,
    definitions: CommandOptions
): [T, OptionDefinition] | undefined => {
    return Object.entries<OptionDefinition>(definitions).find(
        ([key, definition]) => {
            if (typeof definition.name === 'undefined') {
                return key === option.name;
            } else if (typeof definition.name === 'string') {
                return definition.name === option.name;
            } else {
                return (
                    definition.name.long === option.name ||
                    definition.name.short === option.name
                );
            }
        }
    ) as [T, OptionDefinition] | undefined;
};

export const matchParsedOptionsByDefinition = (
    [defKey, definition]: [string, OptionDefinition],
    parsedOptions: ParsedOption[]
): ParsedOption[] => {
    const definitionNames: string[] = [];

    if (typeof definition.name === 'undefined') {
        definitionNames.push(defKey);
    } else if (typeof definition.name === 'string') {
        definitionNames.push(definition.name);
    } else {
        if (definition.name.short) definitionNames.push(definition.name.short);
        if (definition.name.long) definitionNames.push(definition.name.long);
    }

    return parsedOptions.filter((opt) => {
        return definitionNames.some((name) => name === opt.name);
    });
};

export const stringifyOptionDefintion = ([key, defintion]: [
    string,
    OptionDefinition,
]): string => {
    const isLong = (option: string) => option.length > 1;

    if (typeof defintion.name === 'undefined') {
        return isLong(key) ? '--' + key : '-' + key;
    } else if (typeof defintion.name === 'string') {
        return isLong(defintion.name)
            ? '--' + defintion.name
            : '-' + defintion.name;
    } else {
        return defintion.name.long
            ? '--' + defintion.name.long
            : '-' + defintion.name.short;
    }
};
