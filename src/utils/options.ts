import { countLeadingDashes } from ".";
import { ArgumentType, OptionVariant } from "../enums";
import { OptionDefinition, OptionValue, FormattedOption } from "../types";

export const getOptionValue = (
    definedOption: OptionDefinition['name'] | string, // Option defined by user
    dataOptions: FormattedOption[] // Options passed to CLI
): OptionValue | undefined => {
    const isLong = (optName: string) => optName.length > 1;

    if (typeof definedOption === 'string') {
        const dataOption = dataOptions.find(({ name }) => {
            return definedOption === name;
        });
        if (!dataOption) return;
        const variant = dataOption.variant;
        const isDefinedOptLong = isLong(definedOption);

        if (
            variant === OptionVariant.Long && isDefinedOptLong
            || variant === OptionVariant.Short && !isDefinedOptLong
        ) {
            return dataOption.value;
        }

        return;
    } else {
        if (definedOption?.[OptionVariant.Long] && definedOption[OptionVariant.Short]) {
            return dataOptions.find(({ name }) => {
                if (isLong(name)) {
                    return definedOption[OptionVariant.Long] === name;
                } else {
                    return definedOption[OptionVariant.Short] === name;
                }
            })?.value;
        }

        if (definedOption?.[OptionVariant.Long]) {
            return dataOptions.find(({ name }) => {
                return definedOption[OptionVariant.Long] === name;
            })?.value;
        }

        if (definedOption?.[OptionVariant.Short]) {
            return dataOptions.find(({ name }) => {
                return definedOption[OptionVariant.Short] === name;
            })?.value;
        }
    }
}


export const parseOption = (option: string): FormattedOption => {
    const dashesCount = countLeadingDashes(option);

    if (dashesCount > 2) {
        throw new Error("Invalid option format. You should use - or -- to define option")
    }

    const optionName = option.slice(dashesCount);

    if (dashesCount === 1 && optionName.length === 1) {
        return {
            type: ArgumentType.Option,
            value: true,
            name: optionName,
            variant: OptionVariant.Short
        };
    } else if (dashesCount === 2 && optionName.length > 1) {
        return {
            type: ArgumentType.Option,
            value: true,
            name: optionName,
            variant: OptionVariant.Long
        };
    } else {
        throw new Error("Short options should only have one dash and one latter and Long options should have 2 dashes and more than 2 chars")
    }

}
