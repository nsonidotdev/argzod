import { OptionVariant } from "../enums";
import { OptionDefinition, FormattedOption, CommandOptions } from "../types";

export const matchOptionDefinition = <T extends string>(option: FormattedOption, definitions: CommandOptions): [T, OptionDefinition] | undefined => {
    return Object.entries<OptionDefinition>(definitions)
        .find(([key, definition]) => {
            if (typeof definition.name === 'undefined') {
                return key === option.name;
            } else if (typeof definition.name === "string") {
                return definition.name === option.name;
            } else {
                return definition.name.long === option.name || definition.name.short === option.name
            };
        }) as [T, OptionDefinition] | undefined

}

export const stringifyOptionDefintion = ([key, defintion]: [string, OptionDefinition]): string => {
    const isLong = (option: string) => option.length > 1;

    if (typeof defintion.name === "undefined") {
        return isLong(key) 
            ? "--" + key
            : "-" + key
    } else if (typeof defintion.name === 'string') {
        return isLong(defintion.name) 
            ? "--" + defintion.name
            : "-" + defintion.name
    } else {
        return defintion.name.long 
            ? "--" + defintion.name.long
            : '-' + defintion.name.short
    }
}
