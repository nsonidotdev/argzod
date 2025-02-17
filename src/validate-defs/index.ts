// Extracting, checking and tranfroming parsed options that relate to a single option definition 
// with values extracted validate each one on user validation functions 

import type { Command } from "../command"
import type { ParsedEntry } from "../types/arguments"
import type { Result } from "../types/result"

export const validateDefs = (command: Command, entries: ParsedEntry[]): Result<any> => {
    const errors = [];

    return {
        errors: [],
        value: [],
    }
}