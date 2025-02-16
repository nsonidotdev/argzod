import { OptionParseType } from "../enums";
import { ArgzodError, ErrorCode } from "../errors";
import type { OptionValidationInput } from "../types";
import type { ParsedOption } from "../types/arguments";
import type { CommandOptions } from "../types/command";
import type { OptionDef } from "../types/option-def";
import { matchParsedOptionsByDefinition, stringifyOptionDefintion } from "../utils/options";

type CollectedData = { passed: boolean, value: OptionValidationInput, options: ParsedOption[], definition: OptionDef, }
export const collectOptionsData = (parsedOptions: ParsedOption[], defs: CommandOptions): Record<string, CollectedData> => {
    return Object.fromEntries(
        Object.entries(defs)
            .map(([key, def]): [string, CollectedData] => {
                const options = matchParsedOptionsByDefinition(def, parsedOptions);
                const appliedResult = applyParsingStrategy(def, options);

                if (appliedResult instanceof ArgzodError) { 
                    appliedResult.__setPath(stringifyOptionDefintion(def));
                    
                    throw appliedResult 
                }; // TODO: handle error

                return [key, { value: appliedResult, options, definition: def, passed: !!options.length }];
            })
    );
}

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

const parseSingleOption = (options: ParsedOption[]): OptionValidationInput<'signle'> | ArgzodError => {
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

const applyParsingStrategy = (def: OptionDef, options: ParsedOption[]): OptionValidationInput | ArgzodError => {
    const strategies = {
        [OptionParseType.Boolean]: parseBooleanOption,
        [OptionParseType.Single]: parseSingleOption,
        [OptionParseType.Many]: parseManyOption
    };

    return strategies[def.parse](options);
};
