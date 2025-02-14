import { OptionParseType } from './enums';
import type { OptionDef } from './types/option-def';

export const helpOption: OptionDef = {
    parse: OptionParseType.Boolean,
    description: 'Logs out detailed infromation about a command',
    name: ['help', 'h'],
};
