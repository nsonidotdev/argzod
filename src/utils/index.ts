import { OptionVariant } from "../enums";
import { OptionDefinition, OptionValue, ParsedOption } from "../types";

export const getOptionValue = (
    definedOption: OptionDefinition['name'] | string, // Option defined by user
    dataOptions: Record<string, ParsedOption> // Options passed to CLI
): OptionValue | undefined => {
    const isLong = (optName: string) => optName.length > 1;

    if (typeof definedOption === 'string') {
        const dataOption = Object.entries(dataOptions).find(([optName]) => {
            return definedOption === optName;
        });
        if (!dataOption) return;
        const variant = dataOption[1].variant;
        const isDefinedOptLong = isLong(definedOption);

        if (
            variant === OptionVariant.Long && isDefinedOptLong
            || variant === OptionVariant.Short && !isDefinedOptLong
        ) {
            return dataOption[1].value;
        }

        return;
    } else {
        if (definedOption?.[OptionVariant.Long] && definedOption[OptionVariant.Short]) {
            return Object.entries(dataOptions).find(([optName]) => {
                if (isLong(optName)) {
                    return definedOption[OptionVariant.Long] === optName;
                } else {
                    return definedOption[OptionVariant.Short] === optName;
                }
            })?.[1].value;
        }

        if (definedOption?.[OptionVariant.Long]) {
            return Object.entries(dataOptions).find(([optName]) => {
                return definedOption[OptionVariant.Long] === optName;
            })?.[1].value;
        }

        if (definedOption?.[OptionVariant.Short]) {
            return Object.entries(dataOptions).find(([optName]) => {
                return definedOption[OptionVariant.Short] === optName;
            })?.[1].value;
        }
    }
}