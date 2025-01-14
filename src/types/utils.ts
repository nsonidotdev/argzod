import type { z } from "zod";
import { ArgumentDefinition, OptionDefinition } from "./arguments";

export type InferCommandArguments<TArgs extends Array<ArgumentDefinition>> = {
    [K in keyof TArgs]: z.infer<TArgs[K]['schema']>;
};

export type InferCommandOptions<TOpts extends Record<string, OptionDefinition>> = {
    [K in keyof TOpts]: TOpts[K]['schema'] extends z.ZodType<any> 
        ? z.infer<TOpts[K]['schema']>
        : true;
};

export type ObjectValues<T extends Record<string, any>> = T[keyof T]