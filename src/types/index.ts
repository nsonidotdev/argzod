import type { ErrorLevel, OptionParseType } from '../enums';
import type { ArgzodError } from '../errors';
import type { errorMessageMap } from '../errors/messages';
import type { ObjectValues } from './utils';

export type MessageMap = Partial<typeof errorMessageMap>;
export type GroupedErrors = Record<ErrorLevel, ArgzodError[]>;

export type OptionParsedReturnType = {
    [OptionParseType.Boolean]: boolean;    
    [OptionParseType.Single]: string | undefined;    
    [OptionParseType.Many]: string[];    
};
export type OptionValidationInput<T extends keyof OptionParsedReturnType | undefined = undefined> = T extends string ? OptionParsedReturnType[T] : ObjectValues<OptionParsedReturnType>;