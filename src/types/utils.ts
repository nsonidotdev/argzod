import type { z } from 'zod';
import type { CommandArguments, CommandOptions } from './command';
import type { OptionParsedReturnType } from '.';

export type InferCommandArguments<TArgs extends CommandArguments> = {
    [K in keyof TArgs]: z.infer<TArgs[K]['schema']>;
};

export type InferCommandOptions<TOpts extends CommandOptions> = {
    [K in keyof TOpts]: TOpts[K]['schema'] extends z.ZodType<any>
        ? z.infer<TOpts[K]['schema']>
        : OptionParsedReturnType[TOpts[K]['parse']]
};

export type ObjectValues<T extends Record<string, any>> = T[keyof T];
