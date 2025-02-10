import type { MessageMap } from '.';
import type { ArgzodError } from '../errors';

export type ProgramConfig = {
    messages?: MessageMap;
    onError?: (errors: ArgzodError[]) => void;
};
