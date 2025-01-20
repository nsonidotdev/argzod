import { ObjectValues } from "../types/utils";

export const ErrorCode = {
    Other: "other",
    ZodParse: "zod-parse",
    InvalidShortOptionFormat: "invalid-short-option",
    InvalidLongOptionFormat: "invalid-long-option",
    InvalidOptionFormat: "invalid-option",
    OptionNotDefined: "option-not-defined",
    CommandNotFound: "command-not-found",
    CommandDuplication: "command-duplication"
} as const;
export type ErrorCode = ObjectValues<typeof ErrorCode>
