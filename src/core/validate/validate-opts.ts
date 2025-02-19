import { OptionParseType } from "../../enums";
import { ArgzodError, ErrorCode } from "../../errors";
import type { OptionValidationInput, ValidatedOption } from "../../types/entries";
import type { ParsedOption } from "../../types/entries";
import type { CommandOptions } from "../../types/command";
import type { OptionDef } from "../../types/option-def";
import { matchParsedOptionsByDefinition, stringifyOptionDefintion } from "../../utils/options";
import { operation } from "../../utils/operation";


export const validateOptions = operation((ctx, parsedOptions: ParsedOption[], defs: CommandOptions): { validated: Record<string, ValidatedOption>, unknown: ParsedOption[] } => {
    const capturedOptionsIndecies: Set<number> = new Set();
    const errors: ArgzodError[] = [];

    const validatedOptions = Object.fromEntries(
        Object.entries(defs)
            .map(([key, def]): [string, ValidatedOption] => {
                const options = matchParsedOptionsByDefinition(def, parsedOptions);
                options.forEach(o => capturedOptionsIndecies.add(o.index));

                const appliedResult = applyParsingStrategy(def, options);

                if (appliedResult instanceof ArgzodError) {
                    appliedResult.__setPath(stringifyOptionDefintion(def));
                    errors.push(appliedResult);
                    return [key, { value: undefined, definition: def, options: options }]
                };

                let validatedData = appliedResult;

                if (def.schema) {
                    const zodResult = def.schema.safeParse(appliedResult)

                    if (!zodResult.success) {
                        errors.push(
                            new ArgzodError({
                                code: ErrorCode.Validation,
                                path: stringifyOptionDefintion(def),
                                ctx: [zodResult.error],
                            })
                        );
                        return [key, { value: undefined, definition: def, options: options }]
                    }

                    validatedData = zodResult.data;

                }

                return [key, { value: validatedData, options, definition: def }];
            })
    );

    const unknownOptions = parsedOptions.filter((_, index) => {
        return !capturedOptionsIndecies.has(index);
    })


    return {
        validated: validatedOptions,
        unknown: unknownOptions
    }
})


const applyParsingStrategy = (def: OptionDef, options: ParsedOption[]): OptionValidationInput | ArgzodError => {
    const strategies = {
        [OptionParseType.Boolean]: parseBooleanOption,
        [OptionParseType.Single]: parseSingleOption,
        [OptionParseType.Many]: parseManyOption
    };

    return strategies[def.parse](options);
};

const parseBooleanOption = (options: ParsedOption[]): OptionValidationInput<'boolean'> | ArgzodError => {
    if (!options.length) return false;

    const hasNoValues = options.every(o => o.value.length === 0);
    const isNotDuplicated = options.length < 2;

    if (!hasNoValues || !isNotDuplicated) {
        return new ArgzodError({
            code: ErrorCode.InvalidOptionValue,
            ctx: [{ shouldBe: OptionParseType.Boolean }]
        });
    }

    return options.length === 1;
};

const parseSingleOption = (options: ParsedOption[]): OptionValidationInput<'single'> | ArgzodError => {
    if (!options.length) return undefined;

    const isNotDuplicated = options.length < 2;
    const hasSingleOrNoValue = options.every(o => o.value.length === 0 || o.value.length === 1);

    if (!isNotDuplicated || !hasSingleOrNoValue) {
        return new ArgzodError({
            code: ErrorCode.InvalidOptionValue,
            ctx: [{ shouldBe: OptionParseType.Single }],
        });
    }

    return options[0]?.value[0];
};

const parseManyOption = (options: ParsedOption[]): OptionValidationInput<'many'> => {
    return options.reduce<string[]>((acc, opt) => [...acc, ...opt.value], []);
};


