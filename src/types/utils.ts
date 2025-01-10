import type { z } from "zod";
import { ArgumentDefinition, OptionDefinition } from ".";

export type InferArgumentType<TArgs extends Array<ArgumentDefinition>> = {
    [K in keyof TArgs]: z.infer<TArgs[K]['schema']>;
};

export type InferOptionType<TOpts extends Record<string, OptionDefinition>> = {
    [K in keyof TOpts]: TOpts[K]['schema'] extends z.ZodType<any> 
        ? z.infer<TOpts[K]['schema']>
        : true;
};
