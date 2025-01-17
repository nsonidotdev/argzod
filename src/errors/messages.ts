import { ErrorCode } from "./codes";

export const errorMessageMap: Record<ErrorCode, string> = {
    [ErrorCode.ZodParse]: "Zod parsing error",
    [ErrorCode.CommandNotFound]: "Command not found",
    [ErrorCode.InvalidLongOptionFormat]: "Long options should contain at least 2 characters",
    [ErrorCode.InvalidShortOptionFormat]: "Short options should only contain one character",
    [ErrorCode.InvalidOptionFormat]: "Invalid option format. You should use - or -- to define option",
    [ErrorCode.OptionNotDefined]: "Option is not defined",
    [ErrorCode.Other]: "Unknown error"
};

