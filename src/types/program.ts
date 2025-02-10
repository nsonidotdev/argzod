import type { GroupedErrors, MessageMap } from '.';
import type { ErrorLevel } from '../enums';

export type ProgramConfig = {
    messages?: MessageMap;
    onError?: (errors: GroupedErrors) => void;
    undefinedOptionsBehavior?: ErrorLevel;
};
