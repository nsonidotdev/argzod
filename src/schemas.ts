import { z } from 'zod';

const flagSchema = z
    .string()
    .or(z.undefined())
    .refine(
        (v) => {
            if (v === '' || v === undefined) return true;
            return false;
        },
        { message: "Flag option can't take any values" }
    )
    .transform((v) => {
        if (v === '') return true;
        if (v === undefined) return false;
        return false;
    });

export const schemas = {
    flagSchema,
} as const;
