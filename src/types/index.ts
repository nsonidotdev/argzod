import type { ErrorLevel, OptionParseType } from '../enums';
import type { ArgzodError } from '../errors';
import type { errorMessageMap } from '../errors/messages';

export type MessageMap = Partial<typeof errorMessageMap>;
export type GroupedErrors = Record<ErrorLevel, ArgzodError[]>;

export type OptionParsedReturnType = {
    [OptionParseType.Boolean]: boolean;    
    [OptionParseType.Single]: string;    
    [OptionParseType.Many]: string[];    
};