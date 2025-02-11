import type { GroupedErrors, MessageMap } from '.';
import type { ErrorLevel } from '../enums';

export type ProgramConfig = {
    name: string; // name of a CLI tool
    description?: string;
    messages?: MessageMap;
    onError?: (errors: GroupedErrors) => void;
    undefinedOptionsBehavior?: ErrorLevel;
};
