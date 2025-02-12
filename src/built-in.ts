import { OptionParseType } from './enums';
import { schemas } from './schemas';
import type { OptionDef } from './types/option-def';

export const helpOption: OptionDef = {
    parse: OptionParseType.Boolean,
    schema: schemas.flagSchema,
    description: 'Logs out detailed infromation about a command',
    name: ['help', 'h'],
};
