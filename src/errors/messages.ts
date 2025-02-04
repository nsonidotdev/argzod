import type { ZodError} from 'zod';
import { ErrorCode } from './codes';

export const errorMessageMap = {
    [ErrorCode.ZodParse]: (error: ZodError) => error.issues.map((i) => i.message).join('\n'),
    [ErrorCode.CommandNotFound]: (commandName?: string) => `Command ${commandName ? commandName : ""} not found`,
    [ErrorCode.ShortInlineOptionsNotSupported]:
        'Short inline options are not supported',
    [ErrorCode.CanNotCombineOptValueStyles]: 'Can not use multiple value styles on one option',
    [ErrorCode.InvalidInlineOptionFormat]:
        'Invalid inline option format. Example: --option=value',
    [ErrorCode.InvalidOptionName]:
        'Option name can only contain following characters: alphanumeric _ -',
    [ErrorCode.InvalidLongOptionFormat]:
        'Long options should contain at least 2 characters',
    [ErrorCode.InvalidShortOptionFormat]:
        'Short options should only contain one character',
    [ErrorCode.InvalidOptionFormat]:
        'Invalid option format. You should use - or -- to define option',
    [ErrorCode.OptionNotDefined]: 'Option is not defined',
    [ErrorCode.CommandDuplication]: 'Duplicate command in programw',
    [ErrorCode.Other]: 'Unknown error',
    [ErrorCode.InvalidPositionalArguments]: "Too many positional arguemts"
} satisfies Record<ErrorCode, string | ((...args: any) => string)>;

