import type { ZodError } from 'zod';
import { ErrorCode } from './codes';
import type { ErrorMessageFn } from './types';
import chalk from 'chalk';
import { OptionParseType } from '../enums';

export const errorMessageMap = {
    [ErrorCode.Validation]: (error: ZodError) => error.issues.map((i) => i.message).join('\n'),
    [ErrorCode.CommandNotFound]: (commandName?: string) =>
        `Unknown command${commandName ? ` ${chalk.bold(commandName)}` : ''}`,
    [ErrorCode.InvalidOption]: 'Option format is invalid. Type --help to get instructions.',
    [ErrorCode.InvalidOptionValue]: ({ shouldBe }: { shouldBe: OptionParseType }) => {
        if (shouldBe === OptionParseType.Boolean) {
            return `Expected no values but got values`;
        }
        if (shouldBe === OptionParseType.Single) {
            return `Expected single value but got multiple or no values`;
        }
        return `Expected multiple values but got single or no values`;
    },
    [ErrorCode.OptionNotDefined]: 'Option is not defined.',
    [ErrorCode.Internal]: 'This should not happen. It you see this please add a GitHub issue on argzod.',
    [ErrorCode.InvalidArguments]: 'Invalid positional',
    [ErrorCode.InvalidDefinitions]: 'Command, option or argument definitions are invalid',
} satisfies Record<ErrorCode, string | ErrorMessageFn>;
