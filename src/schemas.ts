import { z } from "zod";

export const flagSchema = z.any()
    .refine((v) => {
        if (v === true) return true;
        if (v == null) return true;
        return false;
    }, { message: "Flag can't take any values" }).transform(v => {
        if (v === true) return true;
        return false;
    });