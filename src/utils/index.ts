import type { z } from 'zod';

export const countLeadingDashes = (arg: string) => {
    const indexOfDash = [...arg].findIndex((char) => char !== '-');
    return indexOfDash === -1 ? arg.length : indexOfDash;
};

export const stringifyZodError = (error: z.ZodError) => {
    return error.issues.map((i) => i.message).join('\n');
};

export const removeObjectKeys = <
    T extends Record<string, any>,
    U extends keyof T,
>(
    object: T,
    keys: U[]
): Omit<T, U> => {
    const result = { ...object };
    for (const key of keys) {
        delete result[key];
    }
    return result;
};

export const isValidOptionName = (string: string) =>
    /^[a-zA-Z0-9-_]+$/.test(string);
export const isNumericString = (str: string) => /^[0-9]+$/.test(str);
