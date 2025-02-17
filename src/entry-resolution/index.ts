import type { Command } from "../command";
import type { ParsedEntry } from "../types/arguments";
import type { Result } from "../types/result";



export const resolveEntries = (command: Command, entries: ParsedEntry[]): Result<ParsedEntry[]> => {
    return {
        errors: [],
        value: entries,
    }
}