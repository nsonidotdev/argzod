import type { z } from 'zod';
import type { OptionParseType } from '../enums';

type BaseOptionDef = {
    description?: string;
    name: Array<string> | string;
    schema?: z.ZodType<any>;
};

export type BooleanOptionDef = BaseOptionDef & {
    parse: (typeof OptionParseType)['Boolean'];
    // TODO negatable: boolean; 
};

export type SingleOptionDef = BaseOptionDef & {
    parse: (typeof OptionParseType)['Single'];
};

export type ManyOptionDef = BaseOptionDef & {
    parse: (typeof OptionParseType)['Many'];
};

export type OptionDef = 
    | BooleanOptionDef
    | SingleOptionDef
    | ManyOptionDef