import type { ParsedOption } from '../types/arguments';
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
): ParsedOption[] => {
    const definitionNames: string[] = [];

    if (typeof definition.name === 'string') {
        definitionNames.push(definition.name);
    } else {
        definitionNames.push(...definition.name);
    }

    return parsedOptions.filter((opt) => {
        return definitionNames.some((name) => name === opt.name);
    });
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

// value - is all values of same option merged into 1 array
type GroupOptionsByDefsValue = 
 | { value: undefined, options: never[], definition: OptionDef, passed: false }
 | { value: string[], options: ParsedOption[], definition: OptionDef, passed: true }
export const groupOptionsByDefs = (parsedOptions: ParsedOption[], defs: CommandOptions): Record<string, GroupOptionsByDefsValue> => {
    return Object.fromEntries(
        Object.entries(defs)
            .map(([key, def]): [string, GroupOptionsByDefsValue] => {
                const options = matchParsedOptionsByDefinition(def, parsedOptions);
                if (!options.length) return [key, { definition: def, options: [], value: undefined, passed: false }];

                const merged = options.reduce<string[]>((acc, opt) => acc.concat(opt.value), [])
                return [key, { value: merged, options, definition: def, passed: true }];
            })
    );
}