import type { ZodError } from 'zod';
import { ErrorCode } from './codes';
import type { ErrorMessageFn } from './types';

export const errorMessageMap = {
    [ErrorCode.Validation]: (error: ZodError) => error.issues.map((i) => i.message).join('\n'),
    [ErrorCode.CommandNotFound]: (commandName?: string) => `Command ${commandName ? commandName : ''} not found.`,
    [ErrorCode.InvalidOption]: 'Option format is invalid. Type --help to get instructions.',
    [ErrorCode.OptionNotDefined]: 'Option is not defined.',
    [ErrorCode.Internal]: 'This should not happen. It you see this please add a GitHub issue on argzod.',
    [ErrorCode.InvalidArguments]: 'Invalid positional',
    [ErrorCode.InvalidDefinitions]: 'Command, option or argument definitions are invalid',
} satisfies Record<ErrorCode, string | ErrorMessageFn>;
