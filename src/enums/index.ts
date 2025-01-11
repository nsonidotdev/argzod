import { ObjectValues } from "../types/utils";

export const OptionVariant = {
    Long: "long",
    Short: "short",
} as const;
export type OptionVariant = ObjectValues<typeof OptionVariant>;

export const ArgumentType = {
    Argument: "argument",
    Option: "option",
} as const;
export type ArgumentType = ObjectValues<typeof ArgumentType>;