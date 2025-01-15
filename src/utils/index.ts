import { OptionVariant } from "../enums";
import { OptionDefinition, OptionValue, ParsedOption } from "../types";


export const countLeadingDashes = (arg: string) => {
    const indexOfDash = [...arg].findIndex(char => char !== '-');
    return indexOfDash === -1
        ? arg.length
        : indexOfDash;
}

export const isOptionValid = (arg: string): true | string => {
    const leadingDashesCount = countLeadingDashes(arg);
    const optionName = arg.slice(leadingDashesCount);

    if (leadingDashesCount === 0) {
        return "Option should start with - character"
    }

    // TODO: Support for option bundling
    if (leadingDashesCount === 1) {
        if (optionName.length === 1) {
            return true
        } else {
            return "Short options should only contain one character"
        }
    }

    if (leadingDashesCount === 2) {
        if (optionName.length > 1) {
            return true
        } else {
            return "Long options should contain at least 2 characters";
        }
    }

    if (leadingDashesCount > 2 && optionName.length !== 0) {
        return "Invalid option format. You should use - or -- to define option"
    }

    return `Something went wrong validating the option "${arg}"`
}

type Result<T, E = any> = {
    data: T;
    error: null;
} | {
    data: null,
    error: E
}
type DataSource<T> = Promise<T> | (() => Promise<T>)
export async function handleError<T, E = any>(dataSource: DataSource<T>): Promise<Result<T, E>> {
    try {
        let data: T | null = null;

        if (typeof dataSource === 'function') {
            data = await dataSource();
        } else {
            data = await dataSource;
        }

        return {
            data,
            error: null
        } 
    } catch (error) {
        return {
            data: null,
            error: error as E
        }
    }
}
