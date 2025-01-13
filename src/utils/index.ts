import { OptionVariant } from "../enums";
import { OptionDefinition, OptionValue, ParsedOption } from "../types";


export const countLeadingDashes = (arg: string) => {
    const indexOfDash = [...arg].findIndex(char => char !== '-');
    return indexOfDash === -1
        ? arg.length
        : indexOfDash;
}