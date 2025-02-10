import type { ErrorLevel } from '../enums';
import type { ArgzodError } from '../errors';
import type { errorMessageMap } from '../errors/messages';

export type MessageMap = Partial<typeof errorMessageMap>;
export type GroupedErrors = Record<ErrorLevel, ArgzodError[]>;