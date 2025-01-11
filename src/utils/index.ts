import { OptionDefinition, OptionValue, OptionVariant, ParsedOption } from "../types";

// TODO: check and return option naming
// export const checkOptionNaming = (value: string): OptionVariant => {
// };



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
            variant === 'long' && isDefinedOptLong
            || variant === 'short' && !isDefinedOptLong
        ) {
            return dataOption[1].value;
        }

        return;
    } else {
        if (definedOption?.long && definedOption.short) {
            return Object.entries(dataOptions).find(([optName]) => {
                if (isLong(optName)) {
                    return definedOption.long === optName;
                } else {
                    return definedOption.short === optName;
                }
            })?.[1].value;
        }

        if (definedOption?.long) {
            return Object.entries(dataOptions).find(([optName]) => {
                return definedOption.long === optName;
            })?.[1].value;
        }

        if (definedOption?.short) {
            return Object.entries(dataOptions).find(([optName]) => {
                return definedOption.short === optName;
            })?.[1].value;
        }
    }
}