import type { ObjectValues } from '../types/utils';

export const ErrorCode = {
    Internal: 'internal',
    Validation: 'zod-parse', // zod validation failed
    InvalidOption: 'unknown-option', // Option written in not supported option format
    OptionNotDefined: 'option-not-defined', // Option was not defined in any command
    InvalidArguments: 'invalid-args', // Any error related to positional arguments
    CommandNotFound: 'command-not-found', // Command was not defined by user
    InvalidDefinitions: 'invalid-definitions', // Program, command, option or argument definitions are wrong
} as const;
export type ErrorCode = ObjectValues<typeof ErrorCode>;
