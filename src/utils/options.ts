import { OptionVariant } from "../enums";
import { OptionDefinition, FormattedOption } from "../types";

export const getOptionValue = (
    definedOption: OptionDefinition['name'] | string, // Option defined by user
    dataOptions: FormattedOption[] // Options passed to CLI
): string | undefined => {
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

