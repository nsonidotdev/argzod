import type { Command } from "../../api/command";
import { EntryType } from "../../enums";
import { ArgzodError, ErrorCode } from "../../errors";
import type { ParsedPositionalArgument } from "../../types/entries";
import { operation } from "../../utils/operation";

export const validateArgs = operation((ctx, command: Command, entries: ParsedPositionalArgument[]): unknown[] => {
    const args = entries.filter(e => e.type === EntryType.Argument);

    const validatedArgs = command.args.reduce<unknown[]>((acc, arg, index) => {
        const userArg = args[index]?.value;

        if (!arg.schema) {
            if (arg === undefined) return acc;
            return [...acc, arg]
        };

        const parseResult = arg.schema.safeParse(userArg);
        if (!parseResult.success) {
            ctx.errors.add(new ArgzodError({
                code: ErrorCode.Validation,
                path: `Argument ${index + 1}`,
                ctx: [parseResult.error],
            }))

            return acc;
        }

        return [...acc, parseResult.data];
    }, [])

    if (args.length > command.args.length) {
        ctx.errors.add(new ArgzodError({
            code: ErrorCode.InvalidArguments,
        }))
    }

    return validatedArgs;
})