import type { z } from "zod";
import { ArgumentDefinition, OptionDefinition } from "./arguments";
import { CommandArguments, CommandOptions } from "./command";

export type InferCommandArguments<TArgs extends CommandArguments> = {
    [K in keyof TArgs]: z.infer<TArgs[K]['schema']>;
};

export type InferCommandOptions<TOpts extends CommandOptions> = {
    [K in keyof TOpts]: TOpts[K]['schema'] extends z.ZodType<any> 
        ? z.infer<TOpts[K]['schema']>
        : boolean;
};

export type ObjectValues<T extends Record<string, any>> = T[keyof T]