import type { z } from 'zod';
import type { ArgzodError } from '../errors';
import type { GroupedErrors } from '../types';
import { ErrorLevel } from '../enums';

export const countLeadingDashes = (arg: string) => {
    const indexOfDash = [...arg].findIndex((char) => char !== '-');
    return indexOfDash === -1 ? arg.length : indexOfDash;
};

export const stringifyZodError = (error: z.ZodError) => {
    return error.issues.map((i) => i.message).join('\n');
};

export const removeObjectKeys = <T extends Record<string, any>, U extends keyof T>(
    object: T,
    keys: U[]
): Omit<T, U> => {
    const result = { ...object };
    for (const key of keys) {
        delete result[key];
    }
    return result;
};

export const isValidOptionName = (string: string) => /^[a-zA-Z0-9-_]+$/.test(string);
export const isNumericString = (str: string) => /^[0-9]+$/.test(str);

export const generateGuid = () => {
    const S4 = () => {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
};

export const groupErrors = (errors: ArgzodError[], matcher: (error: ArgzodError) => ErrorLevel): GroupedErrors => {
    const groupedErrors = errors.reduce<GroupedErrors>(
        (acc, error) => {
            const errorLevel = matcher(error);

            return {
                ...acc,
                [errorLevel]: acc[errorLevel].concat(error),
            };
        },
        {
            [ErrorLevel.Error]: [],
            [ErrorLevel.Warn]: [],
            [ErrorLevel.Ignore]: [],
        }
    );

    return groupedErrors;
};
