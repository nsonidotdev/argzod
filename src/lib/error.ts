import { ObjectValues } from "../types";

export const ErrorCode = {
    Other: "other",
    ZodParse: "zod-parse",
    InvalidShortOptionFormat: "invalid-short-option",
    InvalidLongOptionFormat: "invalid-long-option",
    InvalidOptionFormat: "invalid-option",
    OptionNotDefined: "option-not-defined",
    CommandNotFound: "command-not-found",
} as const;
export type ErrorCode = ObjectValues<typeof ErrorCode>


export const errorMessageMap: Record<ErrorCode, string> = {
    [ErrorCode.ZodParse]: "Zod parsing error",
    [ErrorCode.CommandNotFound]: "Command not found",
    [ErrorCode.InvalidLongOptionFormat]: "Long options should contain at least 2 characters",
    [ErrorCode.InvalidShortOptionFormat]: "Short options should only contain one character",
    [ErrorCode.InvalidOptionFormat]: "Invalid option format. You should use - or -- to define option",
    [ErrorCode.OptionNotDefined]: "Option is not defined",
    [ErrorCode.Other]: "Unknown error"
};

export class ArgzodError extends Error {
    code: ErrorCode;
    path?: string;

    constructor({ code, message, path }: { code: ErrorCode, message?: string, path?: string }) {
        message ??= errorMessageMap[code];
        const formattedMessage = path
            ? `${path}: ${message}`
            : message

        super(formattedMessage);
        Object.setPrototypeOf(this, ArgzodError.prototype);

        this.name = "ArgzodError";
        this.code = code;
        this.path = path;
    }
}