import { schemas } from './schemas';
import type { OptionDefinition } from './types/arguments';

export const helpOption: OptionDefinition = {
    schema: schemas.flagSchema,
    description: 'Logs out detailed infromation about a command',
    name: ['help', 'h'],
};
