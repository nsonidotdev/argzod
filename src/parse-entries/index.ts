import type { Command } from "../command"
import type { ParsedEntry } from "../types/arguments"
import type { Result } from "../types/result"

export const parseEntries = (command: Command, entries: string[]): Result<ParsedEntry[]> => {
    const errors = [];

    return {
        errors: [],
        value: [],
    }
}